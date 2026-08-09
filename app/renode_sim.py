"""Renode-backed NUCLEO-F446RE simulation manager for StudioMCU."""

from __future__ import annotations

import os
import re
import shutil
import socket
import subprocess
import tempfile
import threading
import time
from pathlib import Path
from uuid import uuid4

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
SIM_DIR = PROJECT_ROOT / "simulation"

DEFAULT_MONITOR_PORT = 29123
DEFAULT_UART_PORT = 29124

# Nested under GPIO in the platform overlay (Renode 1.16).
LED_DEVICE = "gpioPortA.ld2"
BUTTON_DEVICE = "gpioPortC.userButton"


def _resolve_renode() -> Path | None:
    local = PROJECT_ROOT / "tools" / "renode"
    candidates = [
        Path(os.environ.get("RENODE_PATH", "")),
        local / "renode.exe",
        local / "renode",
        Path(r"C:\Program Files\Renode\renode.exe"),
        Path(r"C:\Program Files (x86)\Renode\renode.exe"),
    ]
    for path in candidates:
        if path and path.is_file():
            return path
    found = shutil.which("renode") or shutil.which("renode.exe")
    return Path(found) if found else None


def _renode_root(renode: Path) -> Path:
    return renode.resolve().parent


def _to_renode_path(path: Path) -> str:
    """Forward-slash path without spaces issues for Renode @-literals."""
    return str(path.resolve()).replace("\\", "/")


class RenodeSimulator:
    """Runs one Renode instance and exposes LED / button / UART for the web UI."""

    def __init__(self) -> None:
        self.process: subprocess.Popen[str] | None = None
        self.monitor_port = DEFAULT_MONITOR_PORT
        self.uart_port = DEFAULT_UART_PORT
        self.uart_buffer = ""
        self._uart_sock: socket.socket | None = None
        self._monitor_sock: socket.socket | None = None
        self._lock = threading.Lock()
        self._reader: threading.Thread | None = None
        self._stop_reader = threading.Event()
        self.running = False
        self.last_error = ""
        self.elf_path: str | None = None
        self.lesson_id: str | None = None
        self.led_on = False
        self.started_at = 0.0
        self._work_dir: Path | None = None

    def available(self) -> dict:
        renode = _resolve_renode()
        return {
            "available": renode is not None,
            "renode_path": str(renode) if renode else None,
            "message": (
                "Renode is ready for NUCLEO-F446RE simulation."
                if renode
                else "Renode not found. Install Renode and ensure renode.exe is on PATH."
            ),
        }

    def stop(self) -> dict:
        self._stop_reader.set()
        with self._lock:
            for sock in (self._uart_sock, self._monitor_sock):
                if sock is not None:
                    try:
                        sock.close()
                    except OSError:
                        pass
            self._uart_sock = None
            self._monitor_sock = None

            if self.process and self.process.poll() is None:
                try:
                    self._monitor_write("quit")
                except OSError:
                    pass
                try:
                    self.process.terminate()
                    self.process.wait(timeout=3)
                except Exception:
                    try:
                        self.process.kill()
                    except Exception:
                        pass
            self.process = None
            self.running = False
            self.led_on = False
            log_file = getattr(self, "_log_file", None)
            if log_file is not None:
                try:
                    log_file.close()
                except Exception:
                    pass
                self._log_file = None  # type: ignore[attr-defined]
        return {"success": True, "message": "Simulation stopped."}

    def start(self, elf_path: Path, lesson_id: str | None = None) -> dict:
        renode = _resolve_renode()
        if renode is None:
            return {
                "success": False,
                "log": "Renode not found. Install from https://renode.io/ and restart StudioMCU.",
            }

        elf_path = Path(elf_path).resolve()
        if not elf_path.is_file():
            return {"success": False, "log": f"ELF not found: {elf_path}"}

        self.stop()
        time.sleep(0.3)

        # Renode path literals break on spaces (e.g. "Python Projects").
        # Stage ELF + scripts under a space-free temp directory.
        work_dir = Path(tempfile.gettempdir()) / "studiomcu_renode" / str(uuid4())
        work_dir.mkdir(parents=True, exist_ok=True)
        self._work_dir = work_dir

        staged_elf = work_dir / "firmware.elf"
        shutil.copy2(elf_path, staged_elf)
        repl_dst = work_dir / "nucleo_f446re.repl"
        shutil.copy2(SIM_DIR / "nucleo_f446re.repl", repl_dst)

        elf_renode = _to_renode_path(staged_elf)
        repl_renode = _to_renode_path(repl_dst)

        resc = (SIM_DIR / "run_template.resc").read_text(encoding="utf-8")
        resc = resc.replace("$bin?=@firmware.elf", f"$bin?=@{elf_renode}")
        resc = resc.replace("$repl?=@nucleo_f446re.repl", f"$repl?=@{repl_renode}")
        resc = resc.replace("$uartPort?=29124", f"$uartPort?={self.uart_port}")
        resc_path = work_dir / "studio_run.resc"
        resc_path.write_text(resc, encoding="utf-8", newline="\n")

        log_path = work_dir / "renode.log"
        cmd = [
            str(renode),
            "--disable-gui",
            "--plain",
            "-P",
            str(self.monitor_port),
            str(resc_path),
        ]

        try:
            log_file = open(log_path, "w", encoding="utf-8", errors="replace")
            self.process = subprocess.Popen(
                cmd,
                cwd=str(_renode_root(renode)),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                text=True,
            )
            self._log_file = log_file  # type: ignore[attr-defined]
        except OSError as exc:
            return {"success": False, "log": f"Failed to start Renode: {exc}"}

        # Do NOT TCP-probe the monitor port — a connect/close aborts Renode's telnet session.
        if not self._wait_log(log_path, "Monitor available", timeout=12.0):
            output = self._read_log(log_path)
            self.stop()
            return {
                "success": False,
                "log": "Renode monitor did not become ready.\n" + output,
            }

        machine_ready = self._wait_log(log_path, "Machine started", timeout=25.0)
        uart_ready = self._wait_port(self.uart_port, timeout=8.0 if machine_ready else 20.0)

        if not uart_ready:
            try:
                self._connect_monitor()
                self._bootstrap_via_monitor(repl_renode, elf_renode)
            except OSError as exc:
                output = self._read_log(log_path)
                self.stop()
                return {
                    "success": False,
                    "log": (
                        "USART2 terminal did not open and monitor bootstrap failed.\n"
                        f"{exc}\n{output}"
                    ),
                }
            if not self._wait_port(self.uart_port, timeout=8.0):
                output = self._read_log(log_path)
                self.stop()
                return {
                    "success": False,
                    "log": "USART2 terminal port did not open.\n" + output,
                }
        else:
            time.sleep(0.3)
            try:
                self._connect_monitor()
            except OSError as exc:
                output = self._read_log(log_path)
                self.stop()
                return {
                    "success": False,
                    "log": f"Could not connect to Renode monitor: {exc}\n{output}",
                }

        if not machine_ready:
            # Script may still be loading; give ELF/start a moment.
            self._wait_log(log_path, "Machine started", timeout=10.0)

        try:
            self._connect_uart()
        except OSError as exc:
            output = self._read_log(log_path)
            self.stop()
            return {
                "success": False,
                "log": f"Could not connect to Renode USART2: {exc}\n{output}",
            }

        self._stop_reader.clear()
        self._reader = threading.Thread(target=self._uart_read_loop, daemon=True)
        self._reader.start()

        self.running = True
        self.elf_path = str(elf_path)
        self.lesson_id = lesson_id
        self.started_at = time.time()
        self.last_error = ""
        self._refresh_led()

        caps = self.capabilities_for_lesson(lesson_id)
        return {
            "success": True,
            "log": (
                f"Renode simulation started for NUCLEO-F446RE.\n"
                f"ELF: {elf_path.name}\n"
                f"USART2 terminal: localhost:{self.uart_port}\n"
                f"Monitor: localhost:{self.monitor_port}\n"
                f"{caps.get('note', '')}"
            ),
            "monitor_port": self.monitor_port,
            "uart_port": self.uart_port,
            "capabilities": caps,
            "led_on": self.led_on,
        }

    def _bootstrap_via_monitor(self, repl_renode: str, elf_renode: str) -> None:
        """If the .resc include fails, set up the machine over telnet monitor."""
        self._monitor_write("mach create")
        time.sleep(0.4)
        self._monitor_write(f"machine LoadPlatformDescription @{repl_renode}")
        time.sleep(2.5)
        self._monitor_write(
            f'emulation CreateServerSocketTerminal {self.uart_port} "usart2_term" false'
        )
        time.sleep(0.3)
        self._monitor_write("connector Connect sysbus.usart2 usart2_term")
        time.sleep(0.3)
        self._monitor_write(f"sysbus LoadELF @{elf_renode}")
        time.sleep(1.0)
        self._monitor_write("start")
        time.sleep(0.5)

    def capabilities_for_lesson(self, lesson_id: str | None) -> dict:
        led = lesson_id in {
            "gpio-led",
            "gpio-bsrr",
            "button-led",
            "systick-blink",
            "timer-pwm",
        }
        button = lesson_id == "button-led"
        uart = lesson_id in {
            "uart-hello",
            "uart-echo",
            "uart-cross",
            "adc-read",
            "i2c-scan",
        }
        notes = {
            "gpio-led": "Watch LD2 blink on the virtual board.",
            "gpio-bsrr": "Watch LD2 turn on/off via BSRR/WritePin.",
            "button-led": "Press B1 on the virtual board to toggle LD2.",
            "systick-blink": "Watch LD2 blink using SysTick/HAL_Delay timing.",
            "uart-hello": "USART2 text appears in Serial Monitor.",
            "uart-echo": "Type in Serial Monitor; firmware should echo characters.",
            "uart-cross": "USART1 is limited in this model — use USART2 lessons for best results.",
            "spi-loopback": "SPI peripherals are limited in this model; LED/UART still update if used.",
            "spi-client": "SPI slave behaviour is limited in Renode F4 model.",
            "timer-pwm": "PWM may appear as LD2 activity depending on duty cycle.",
            "adc-read": "ADC stimulus is limited; UART print path still simulates when used.",
            "i2c-scan": "I2C scan may find no devices unless a sensor model is attached.",
        }
        return {
            "led": led or True,
            "button": button or True,
            "uart": uart or True,
            "note": notes.get(
                lesson_id or "",
                "LD2 (PA5), B1 (PC13), and USART2 are simulated on the virtual Nucleo.",
            ),
        }

    def status(self) -> dict:
        alive = self.process is not None and self.process.poll() is None
        if self.running and not alive:
            self.running = False
            self.last_error = "Renode process exited unexpectedly."
        if self.running:
            self._refresh_led()
        return {
            "running": self.running,
            "led_on": self.led_on,
            "uart_preview": self.uart_buffer[-500:],
            "elf_path": self.elf_path,
            "lesson_id": self.lesson_id,
            "uptime_s": round(time.time() - self.started_at, 1) if self.running else 0,
            "capabilities": self.capabilities_for_lesson(self.lesson_id),
            "renode": self.available(),
            "error": self.last_error,
        }

    def read_uart(self) -> str:
        with self._lock:
            data = self.uart_buffer
            self.uart_buffer = ""
            return data

    def write_uart(self, text: str) -> dict:
        if not self.running or self._uart_sock is None:
            return {"success": False, "message": "Simulation UART is not connected."}
        try:
            self._uart_sock.sendall(text.encode("utf-8", errors="replace"))
            return {"success": True, "message": "Sent to USART2."}
        except OSError as exc:
            return {"success": False, "message": str(exc)}

    def press_button(self, pressed: bool = True) -> dict:
        if not self.running:
            return {"success": False, "message": "Simulation is not running."}
        cmd = f"{BUTTON_DEVICE} Press" if pressed else f"{BUTTON_DEVICE} Release"
        ok = self._monitor_write(cmd)
        return {
            "success": ok,
            "message": "Button pressed." if pressed else "Button released.",
        }

    def tap_button(self, hold_ms: int = 120) -> dict:
        down = self.press_button(True)
        if not down.get("success"):
            return down
        time.sleep(max(hold_ms, 20) / 1000.0)
        up = self.press_button(False)
        self._refresh_led()
        return {
            "success": bool(up.get("success")),
            "message": "User button tapped on virtual NUCLEO-F446RE.",
            "led_on": self.led_on,
        }

    def _refresh_led(self) -> None:
        response = self._monitor_command(f"{LED_DEVICE} State")
        if not response:
            return
        matches = re.findall(r"\b(true|false)\b", response.lower())
        if matches:
            self.led_on = matches[-1] == "true"

    def _connect_monitor(self) -> None:
        sock = socket.create_connection(("127.0.0.1", self.monitor_port), timeout=3)
        sock.settimeout(0.5)
        self._monitor_sock = sock
        try:
            sock.recv(4096)
        except socket.timeout:
            pass

    def _connect_uart(self) -> None:
        sock = socket.create_connection(("127.0.0.1", self.uart_port), timeout=3)
        sock.settimeout(0.2)
        self._uart_sock = sock

    def _uart_read_loop(self) -> None:
        while not self._stop_reader.is_set():
            sock = self._uart_sock
            if sock is None:
                break
            try:
                chunk = sock.recv(4096)
                if not chunk:
                    time.sleep(0.05)
                    continue
                with self._lock:
                    self.uart_buffer += chunk.decode("utf-8", errors="replace")
            except socket.timeout:
                continue
            except OSError:
                break

    def _monitor_write(self, command: str) -> bool:
        sock = self._monitor_sock
        if sock is None:
            return False
        try:
            sock.sendall((command.strip() + "\n").encode("utf-8"))
            return True
        except OSError:
            return False

    def _monitor_command(self, command: str) -> str:
        sock = self._monitor_sock
        if sock is None:
            return ""
        try:
            sock.settimeout(0.05)
            try:
                while True:
                    more = sock.recv(4096)
                    if not more:
                        break
            except socket.timeout:
                pass
            sock.settimeout(0.25)
            sock.sendall((command.strip() + "\n").encode("utf-8"))
            chunks: list[str] = []
            end = time.time() + 1.2
            while time.time() < end:
                try:
                    data = sock.recv(4096)
                    if not data:
                        break
                    chunks.append(data.decode("utf-8", errors="replace"))
                    joined = "".join(chunks)
                    # Skip command echo; wait for a State result or prompt.
                    lower = joined.lower()
                    if "true" in lower or "false" in lower:
                        break
                    if "(machine-" in lower or "(monitor)" in lower:
                        # Got a prompt; keep going a bit unless we already have payload.
                        if len(joined) > len(command) + 8:
                            break
                except socket.timeout:
                    if chunks:
                        continue
            raw = "".join(chunks)
            return re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", raw)
        except OSError as exc:
            self.last_error = str(exc)
            return ""

    @staticmethod
    def _wait_port(port: int, timeout: float) -> bool:
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                with socket.create_connection(("127.0.0.1", port), timeout=0.2):
                    return True
            except OSError:
                time.sleep(0.15)
        return False

    @staticmethod
    def _wait_log(log_path: Path, needle: str, timeout: float) -> bool:
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                text = log_path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                text = ""
            if needle in text:
                return True
            time.sleep(0.15)
        return False

    @staticmethod
    def _read_log(log_path: Path) -> str:
        try:
            return log_path.read_text(encoding="utf-8", errors="replace")[-4000:]
        except OSError:
            return ""


# Shared singleton used by API routes.
simulator = RenodeSimulator()
