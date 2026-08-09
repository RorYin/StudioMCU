# Renode (local portable runtime)

StudioMCU looks for Renode here first:

- Windows: `tools/renode/renode.exe`
- Linux/macOS: `tools/renode/renode`

## Install into this folder

From the repo root:

```bash
python tools/install_renode.py
```

That downloads the official portable package into `tools/renode/` (~100+ MB).
The binary tree is gitignored — only this README is tracked.

## Already installed system-wide?

You can skip this folder. StudioMCU also checks:

1. `RENODE_PATH`
2. `tools/renode/renode(.exe)`  ← this folder
3. `C:\Program Files\Renode\renode.exe`
4. `renode` on PATH

## What *is* committed in-repo

Board/scripts used by Simulation mode live under `simulation/`:

- `nucleo_f446re.repl`
- `run_template.resc`
