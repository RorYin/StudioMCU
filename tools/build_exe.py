#!/usr/bin/env python3
"""Build StudioMCU.exe and stage editable folders beside it."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT / "dist" / "StudioMCU"
RELEASE_DIR = ROOT / "release" / "StudioMCU"
EXTERNAL_FOLDERS = ("lessons", "static", "firmware", "simulation")

RUNTIME_README = """StudioMCU portable package
==========================

Run StudioMCU.exe — it opens http://127.0.0.1:8000 in your browser.

Editable beside this exe (no rebuild needed):
  lessons/      lesson starters and solutions
  static/       web UI (HTML/CSS/JS) and logo
  firmware/     CMSIS/HAL/LL teaching headers
  simulation/   Renode board scripts

Optional:
  tools/renode/   portable Renode (python tools/install_renode.py from the repo)
  toolchain/      ARM GCC + st-flash

Developed By RorYin
"""


def _stage_package(target_dir: Path, built_exe: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(built_exe, target_dir / "StudioMCU.exe")
    for name in EXTERNAL_FOLDERS:
        src = ROOT / name
        dst = target_dir / name
        if not src.is_dir():
            print(f"Skip missing folder: {name}")
            continue
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        print(f"Staged {name}/ -> {target_dir.name}/")
    (target_dir / "README_RUNTIME.txt").write_text(RUNTIME_README, encoding="utf-8")


def main() -> int:
    py = sys.executable
    print("Building StudioMCU.exe with PyInstaller…")
    subprocess.check_call(
        [py, "-m", "PyInstaller", "--noconfirm", "--clean", str(ROOT / "StudioMCU.spec")],
        cwd=str(ROOT),
    )

    built_exe = ROOT / "dist" / "StudioMCU.exe"
    if not built_exe.is_file():
        print(f"Missing built exe: {built_exe}", file=sys.stderr)
        return 1

    _stage_package(DIST_DIR, built_exe)
    _stage_package(RELEASE_DIR, built_exe)

    print(f"\nDone: {RELEASE_DIR / 'StudioMCU.exe'}")
    print(f"Tracked package folder: {RELEASE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
