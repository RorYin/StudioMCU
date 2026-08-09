"""StudioMCU desktop entrypoint (dev + frozen .exe)."""

from __future__ import annotations

import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Ensure repo / extract root is importable before app imports.
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.paths import app_root, ensure_runtime_dirs, is_frozen  # noqa: E402


def _port_open(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=0.35):
            return True
    except OSError:
        return False


def _open_browser_when_ready(url: str, host: str = "127.0.0.1", port: int = 8000) -> None:
    deadline = time.time() + 30
    while time.time() < deadline:
        if _port_open(host, port):
            webbrowser.open(url)
            return
        time.sleep(0.25)


def main() -> None:
    ensure_runtime_dirs()
    root = app_root()
    missing = [name for name in ("static", "lessons") if not (root / name).is_dir()]
    if missing:
        message = (
            "StudioMCU could not find required folders next to the executable:\n"
            + "\n".join(f"  - {name}/" for name in missing)
            + f"\n\nExpected beside:\n  {root}\n"
            "Copy lessons/ and static/ next to StudioMCU.exe and try again."
        )
        if is_frozen():
            try:
                import ctypes

                ctypes.windll.user32.MessageBoxW(0, message, "StudioMCU", 0x10)
            except Exception:
                print(message, file=sys.stderr)
            raise SystemExit(1)
        print(message, file=sys.stderr)
        raise SystemExit(1)

    host = "127.0.0.1"
    port = 8000
    url = f"http://{host}:{port}"

    # Import after path checks so failures are clearer.
    import uvicorn

    from app.main import app  # noqa: F401 — ensures app loads before serve

    if is_frozen() or "--no-browser" not in sys.argv:
        threading.Thread(
            target=_open_browser_when_ready,
            args=(url, host, port),
            daemon=True,
        ).start()

    # Never use reload in the packaged exe.
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()
