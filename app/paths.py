"""Resolve project paths for development and frozen (.exe) runs."""

from __future__ import annotations

import sys
from pathlib import Path


def is_frozen() -> bool:
    return bool(getattr(sys, "frozen", False))


def app_root() -> Path:
    """Directory that contains StudioMCU.exe (or the repo root in development).

    Editable content such as ``lessons/`` and ``static/`` always lives here so
    users can change files without rebuilding the executable.
    """
    if is_frozen():
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


def bundle_root() -> Path:
    """PyInstaller extract dir when frozen; otherwise the same as app_root()."""
    if is_frozen() and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS)
    return app_root()


def ensure_runtime_dirs() -> None:
    root = app_root()
    (root / "builds").mkdir(parents=True, exist_ok=True)
    (root / "docs" / "datasheet_cache").mkdir(parents=True, exist_ok=True)
