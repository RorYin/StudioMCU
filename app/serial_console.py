import threading
import time
from pathlib import Path
from typing import List

import serial
import serial.tools.list_ports


class SerialConsoleManager:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._serial = None
        self._thread = None
        self._running = False
        self._buffer: List[str] = []

    def list_ports(self) -> List[str]:
        return [port.device for port in serial.tools.list_ports.comports()]

    def connect(self, port: str, baud_rate: int = 115200) -> str:
        with self._lock:
            self.disconnect()
            self._serial = serial.Serial(port, baud_rate, timeout=0.1)
            self._running = True
            self._thread = threading.Thread(target=self._read_loop, daemon=True)
            self._thread.start()
        return f"Connected to {port} at {baud_rate} bps."

    def disconnect(self) -> str:
        with self._lock:
            self._running = False
            if self._thread is not None:
                self._thread.join(timeout=0.5)
                self._thread = None
            if self._serial is not None:
                try:
                    self._serial.close()
                except Exception:
                    pass
                self._serial = None
        return "Disconnected."

    def _read_loop(self) -> None:
        while self._running and self._serial is not None:
            try:
                data = self._serial.read(256)
                if data:
                    text = data.decode(errors="replace")
                    with self._lock:
                        self._buffer.append(text)
                else:
                    time.sleep(0.05)
            except Exception:
                time.sleep(0.1)

    def read(self) -> str:
        with self._lock:
            output = "".join(self._buffer)
            self._buffer.clear()
        return output
