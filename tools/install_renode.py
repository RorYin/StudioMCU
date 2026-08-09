#!/usr/bin/env python3
"""Download a portable Renode build into tools/renode/ for StudioMCU."""

from __future__ import annotations

import argparse
import platform
import shutil
import sys
import tarfile
import tempfile
import zipfile
from pathlib import Path
from urllib.request import urlretrieve

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "tools" / "renode"

# Pin to a known-good release used during StudioMCU integration.
RENODE_VERSION = "1.16.1"
BASE = f"https://github.com/renode/renode/releases/download/v{RENODE_VERSION}"

PACKAGES = {
    "Windows": {
        "url": f"{BASE}/renode-{RENODE_VERSION}.windows-portable-dotnet.zip",
        "kind": "zip",
        "exe_names": ("renode.exe",),
    },
    "Linux": {
        "url": f"{BASE}/renode-{RENODE_VERSION}.linux-portable-dotnet.tar.gz",
        "kind": "tar",
        "exe_names": ("renode",),
    },
    "Darwin": {
        "url": f"{BASE}/renode-{RENODE_VERSION}-dotnet.osx-arm64-portable.dmg",
        "kind": "dmg",
        "exe_names": ("renode",),
    },
}


def _system() -> str:
    return platform.system()


def _find_exe(root: Path, names: tuple[str, ...]) -> Path | None:
    for name in names:
        direct = root / name
        if direct.is_file():
            return direct
    for name in names:
        matches = list(root.rglob(name))
        if matches:
            return matches[0]
    return None


def _extract_zip(archive: Path, dest: Path) -> None:
    with zipfile.ZipFile(archive) as zf:
        zf.extractall(dest)


def _extract_tar(archive: Path, dest: Path) -> None:
    with tarfile.open(archive, "r:*") as tf:
        tf.extractall(dest)


def install(force: bool = False) -> int:
    system = _system()
    pkg = PACKAGES.get(system)
    if pkg is None:
        print(f"Unsupported OS for auto-install: {system}", file=sys.stderr)
        return 1

    if pkg["kind"] == "dmg":
        print(
            "macOS auto-extract of .dmg is not supported here.\n"
            f"Download manually: {pkg['url']}\n"
            f"Then place the Renode app contents so `{DEST / 'renode'}` exists.",
            file=sys.stderr,
        )
        return 1

    existing = _find_exe(DEST, pkg["exe_names"])
    if existing and not force:
        print(f"Renode already present: {existing}")
        print("Pass --force to re-download.")
        return 0

    DEST.mkdir(parents=True, exist_ok=True)
    url = pkg["url"]
    print(f"Downloading {url}")
    print(f"Target folder: {DEST}")

    with tempfile.TemporaryDirectory(prefix="renode_dl_") as tmp:
        tmp_path = Path(tmp)
        archive = tmp_path / ("renode.zip" if pkg["kind"] == "zip" else "renode.tar.gz")
        urlretrieve(url, archive)
        extract_dir = tmp_path / "extract"
        extract_dir.mkdir()
        if pkg["kind"] == "zip":
            _extract_zip(archive, extract_dir)
        else:
            _extract_tar(archive, extract_dir)

        found = _find_exe(extract_dir, pkg["exe_names"])
        if found is None:
            print("Downloaded archive did not contain renode executable.", file=sys.stderr)
            return 1

        # Prefer flattening so tools/renode/renode.exe is stable.
        source_root = found.parent
        # Clear previous runtime files but keep README / .gitkeep.
        for child in DEST.iterdir():
            if child.name in {"README.md", ".gitkeep"}:
                continue
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()

        for item in source_root.iterdir():
            target = DEST / item.name
            if item.is_dir():
                shutil.copytree(item, target)
            else:
                shutil.copy2(item, target)

    final = _find_exe(DEST, pkg["exe_names"])
    if final is None:
        print("Install finished but renode executable was not found.", file=sys.stderr)
        return 1

    print(f"Installed Renode to {final}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Install portable Renode into tools/renode/")
    parser.add_argument("--force", action="store_true", help="Re-download even if present")
    args = parser.parse_args()
    return install(force=args.force)


if __name__ == "__main__":
    raise SystemExit(main())
