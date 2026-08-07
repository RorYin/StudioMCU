import os
import re
import shutil
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FIRMWARE_TEMPLATES = BASE_DIR.parent / "firmware"
LOCAL_TOOLCHAIN_ROOTS = [
    BASE_DIR.parent / "arm-gnu-toolchain-12.3.rel1-x86_64-arm-none-eabi",
    BASE_DIR.parent / "toolchain" / "stlink-1.7",
    BASE_DIR.parent / "toolchain",
]


def _resolve_tool(name: str) -> Path | None:
    # A Windows Python process cannot execute the Linux binaries contained in
    # the x86_64 Linux ARM-toolchain archive. Restrict local lookup to .exe
    # files on Windows so a neighbouring Linux archive is never selected.
    executable_names = [f"{name}.exe"] if os.name == "nt" else [name]

    for root in LOCAL_TOOLCHAIN_ROOTS:
        # Downloaded archives may unpack into one or two versioned directory
        # levels (for example, toolchain/stlink/stlink-1.8.0-win32/bin).
        bin_dirs = sorted(
            [root / "bin", *root.glob("*/bin"), *root.glob("*/*/bin")],
            key=lambda path: str(path),
            reverse=True,
        )
        for bin_dir in bin_dirs:
            for executable_name in executable_names:
                exact_path = bin_dir / executable_name
                if exact_path.is_file():
                    return exact_path
    path = shutil.which(name)
    return Path(path) if path else None


def build_firmware(code: str, build_dir: Path) -> dict:
    build_dir.mkdir(parents=True, exist_ok=True)
    main_c = build_dir / "main.c"
    main_c.write_text(code)

    # Copy the full ST-style teaching CMSIS/HAL/LL firmware pack.
    for src in sorted(FIRMWARE_TEMPLATES.iterdir()):
        if src.is_file():
            shutil.copy(src, build_dir / src.name)

    elf_path = build_dir / "firmware.elf"
    bin_path = build_dir / "firmware.bin"
    gcc_path = _resolve_tool("arm-none-eabi-gcc")
    if gcc_path is None:
        return {
            "success": False,
            "log": "Tool not found: arm-none-eabi-gcc. Install the ARM GNU toolchain and add it to PATH.",
        }

    c_sources = sorted(
        path for path in build_dir.glob("*.c") if path.name != "main.c"
    ) + [main_c]

    gcc = [
        str(gcc_path),
        "-mcpu=cortex-m4",
        "-mthumb",
        "-g",
        "-O0",
        "-ffreestanding",
        "-nostdlib",
        "-ffunction-sections",
        "-fdata-sections",
        "-Wall",
        "-Wextra",
        "-I",
        str(build_dir),
        "-T",
        str(build_dir / "linker.ld"),
        "-Wl,--gc-sections",
        "-o",
        str(elf_path),
        *[str(path) for path in c_sources],
    ]
    try:
        result = subprocess.run(gcc, capture_output=True, text=True)
    except OSError as exc:
        return {"success": False, "log": f"Build failed: {exc}. Check that arm-none-eabi-gcc is installed and on PATH."}

    log = result.stdout + result.stderr
    if result.returncode != 0:
        return {"success": False, "log": log}

    objcopy_path = _resolve_tool("arm-none-eabi-objcopy")
    if objcopy_path is None:
        return {
            "success": False,
            "log": "Tool not found: arm-none-eabi-objcopy. Install the ARM GNU toolchain and add it to PATH.",
        }

    objcopy = [
        str(objcopy_path),
        "-O",
        "binary",
        str(elf_path),
        str(bin_path),
    ]
    try:
        result = subprocess.run(objcopy, capture_output=True, text=True)
    except OSError as exc:
        return {"success": False, "log": f"Build failed: {exc}. Check that arm-none-eabi-objcopy is installed and on PATH."}

    log += result.stdout + result.stderr
    if result.returncode != 0:
        return {"success": False, "log": log}

    return {"success": True, "log": log, "firmware_path": str(bin_path)}


def flash_firmware(binary_path: Path, tool: str = "st-flash") -> dict:
    if not binary_path.exists():
        return {"success": False, "log": f"Firmware file not found: {binary_path}"}

    st_flash_path = _resolve_tool(tool)
    if st_flash_path is None:
        return {"success": False, "log": f"Flash tool not found: {tool}. Install st-flash or run install_toolchain.py."}

    command = [str(st_flash_path), "write", str(binary_path), "0x8000000"]
    try:
        result = subprocess.run(command, capture_output=True, text=True)
    except OSError as exc:
        return {"success": False, "log": f"Flash failed: {exc}. Check that {tool} is installed or run install_toolchain.py."}

    log = result.stdout + result.stderr
    return {"success": result.returncode == 0, "log": log}


def board_status() -> dict:
    """Return whether the ST-Link command is installed and sees a target."""
    st_info_path = _resolve_tool("st-info")
    if st_info_path is None:
        return {
            "tool_available": False,
            "connected": False,
            "message": "ST-Link tools are not installed.",
        }

    try:
        result = subprocess.run(
            [str(st_info_path), "--probe"],
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "tool_available": True,
            "connected": False,
            "message": f"Could not check the ST-Link connection: {exc}",
        }

    probe_output = (result.stdout + result.stderr).strip()
    match = re.search(r"Found\s+([1-9]\d*)\s+stlink programmers", probe_output, re.IGNORECASE)
    connected = result.returncode == 0 and match is not None
    return {
        "tool_available": True,
        "connected": connected,
        "message": "STM32 board detected through ST-Link." if connected else "No STM32 board detected through ST-Link.",
        "probe_output": probe_output,
    }


PRESERVED_BUILD_FOLDERS = {"lessons"}


def clear_builds(build_root: Path) -> dict:
    """Delete build output folders, keeping the reserved lessons builds folder."""
    build_root = build_root.resolve()
    build_root.mkdir(parents=True, exist_ok=True)

    deleted: list[str] = []
    preserved: list[str] = []
    errors: list[str] = []

    for entry in sorted(build_root.iterdir(), key=lambda path: path.name.lower()):
        if entry.name in PRESERVED_BUILD_FOLDERS:
            preserved.append(entry.name)
            continue
        try:
            if entry.is_dir():
                shutil.rmtree(entry)
            else:
                entry.unlink()
            deleted.append(entry.name)
        except OSError as exc:
            errors.append(f"{entry.name}: {exc}")

    success = not errors
    kept = ", ".join(preserved) if preserved else "none"
    removed = len(deleted)
    message = f"Cleared {removed} build item(s). Preserved: {kept}."
    if errors:
        message += f" Failed: {len(errors)}."
    return {
        "success": success,
        "deleted": deleted,
        "preserved": preserved,
        "errors": errors,
        "message": message,
    }
