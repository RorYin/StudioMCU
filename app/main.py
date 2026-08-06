import sys
from pathlib import Path
from uuid import uuid4

# Allow both `python app/main.py` (VS Code Run Python File) and
# `python -m app.main` to import the app package correctly.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.lessons import list_lessons, get_lesson
from app.flash import board_status, build_firmware, flash_firmware, clear_builds
from app.serial_console import SerialConsoleManager

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR.parent / "static"
BUILD_DIR = BASE_DIR.parent / "builds"
FIRMWARE_DIR = BASE_DIR.parent / "firmware"
BUILD_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

serial_manager = SerialConsoleManager()

@app.get("/", response_class=HTMLResponse)
def root():
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/api/lessons")
def api_list_lessons():
    return list_lessons()

@app.get("/api/lesson/{lesson_id}")
def lesson_detail(lesson_id: str):
    lesson = get_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@app.get("/api/firmware")
def list_firmware_files():
    """List bundled firmware reference files for the read-only browser."""
    return {
        "files": [
            str(path.relative_to(FIRMWARE_DIR)).replace("\\", "/")
            for path in sorted(FIRMWARE_DIR.rglob("*"))
            if path.is_file()
        ]
    }


@app.get("/api/firmware/{file_path:path}")
def read_firmware_file(file_path: str):
    root = FIRMWARE_DIR.resolve()
    requested = (root / file_path).resolve()
    try:
        requested.relative_to(root)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid firmware file path")
    if not requested.is_file():
        raise HTTPException(status_code=404, detail="Firmware file not found")
    return {
        "path": str(requested.relative_to(root)).replace("\\", "/"),
        "content": requested.read_text(encoding="utf-8"),
    }

@app.post("/api/build")
async def build(request: Request):
    payload = await request.json()
    code = payload.get("code", "")
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    build_dir = BUILD_DIR / str(uuid4())
    build_result = build_firmware(code, build_dir)
    return build_result

@app.post("/api/flash")
async def flash(request: Request):
    payload = await request.json()
    firmware_path = payload.get("firmware_path")
    if not firmware_path:
        raise HTTPException(status_code=400, detail="firmware_path is required")
    result = flash_firmware(Path(firmware_path))
    return result


@app.get("/api/board/status")
def get_board_status():
    return board_status()


@app.post("/api/builds/clear")
def api_clear_builds():
    """Remove temporary build folders, keeping builds/lessons intact."""
    return clear_builds(BUILD_DIR)


@app.get("/api/serial/ports")
def serial_ports():
    return serial_manager.list_ports()

@app.post("/api/serial/connect")
async def serial_connect(request: Request):
    payload = await request.json()
    port = payload.get("port")
    baud = payload.get("baud", 115200)
    if not port:
        raise HTTPException(status_code=400, detail="Serial port required")
    return {"message": serial_manager.connect(port, int(baud))}

@app.post("/api/serial/disconnect")
def serial_disconnect():
    return {"message": serial_manager.disconnect()}

@app.get("/api/serial/read")
def serial_read():
    return {"output": serial_manager.read()}


if __name__ == "__main__":
    import uvicorn

    # This makes VS Code's Run Python File button start the web app directly.
    # Builds write to `builds/`. Restrict the reloader to source directories
    # so it does not restart while the browser is waiting for a build result.
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[
            str(PROJECT_ROOT / "app"),
            str(PROJECT_ROOT / "firmware"),
            str(PROJECT_ROOT / "lessons"),
            str(PROJECT_ROOT / "static"),
        ],
    )
