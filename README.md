# StudioMCU

A FastAPI web app for learning STM32F446RE (NUCLEO-F446RE) embedded C with a VS Code–style browser IDE.

## Features

- Lesson starters and solutions live in `lessons/` as separate text files
- ST-style firmware pack in `firmware/`:
  - CMSIS device header (`stm32f446xe.h` / `stm32f4xx.h`)
  - Compact **HAL** teaching subset (`stm32f4xx_hal*.h/.c`)
  - Compact **LL** teaching subset (`stm32f4xx_ll_*.h`)
- Monaco editor, build with `arm-none-eabi-gcc`, flash with `st-flash`
- **Simulation** mode via [Renode](https://renode.io/) with an on-page NUCLEO-F446RE board GUI
- **Hardware** mode via ST-Link (`st-flash`) when a real board is connected
- Serial monitor via `pyserial` (hardware) or Renode USART2 (simulation)
- Sidebar activity bar: Lessons, Firmware reference (read-only), Board info

## Lessons included

**HAL style (Cube-like)**  
1. GPIO LED blink  
2. GPIO WritePin set/reset  
3. User button + LED  
4. SysTick / `HAL_Delay` blink  

**LL style (Low-Layer)**  
5. USART2 serial hello (ST-Link VCP)  
6. USART2 echo  
7. USART1 external UART  
8. SPI1 master loopback  
9. SPI1 slave client  
10. TIM2 PWM brightness  
11. ADC1 read + serial print  
12. I2C1 bus scan  

## Coding style

Lessons follow STMicroelectronics official naming and patterns:

| Layer | Examples |
|-------|----------|
| HAL | `HAL_Init()`, `__HAL_RCC_GPIOA_CLK_ENABLE()`, `HAL_GPIO_Init()`, `HAL_GPIO_TogglePin()`, `HAL_Delay()` |
| LL | `LL_AHB1_GRP1_EnableClock()`, `LL_GPIO_SetPinMode()`, `LL_USART_TransmitData8()`, `MODIFY_REG` / `SET_BIT` |

Browse the firmware headers in the IDE sidebar to see the same API names used in STM32Cube packages.

## Prerequisites

| Tool | Required for | Notes |
|------|----------------|-------|
| Python 3.11+ | App server | |
| `arm-none-eabi-gcc` / `objcopy` | Build | PATH or `toolchain/` |
| `st-flash` / `st-info` | Hardware flash | Optional if you only use Simulation |
| Renode | Simulation | Install into this repo (below) or system-wide |

## Setup (download and install)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd TwitterBot
```

### 2. Python virtualenv and packages

```bash
python -m venv .venv
```

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Linux / macOS:**

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

`requirements.txt` installs FastAPI, Uvicorn, and pyserial. Renode is **not** on PyPI.

### 3. ARM GCC toolchain (build)

Install GNU Arm Embedded Toolchain so these are available:

- `arm-none-eabi-gcc`
- `arm-none-eabi-objcopy`

Either put them on your PATH, or place a toolchain under `toolchain/` in this repo (e.g. `toolchain/bin/arm-none-eabi-gcc`).

### 4. Renode (simulation — recommended)

Download a portable Renode build **into this repository**:

```bash
python tools/install_renode.py
```

- Installs under `tools/renode/` (about 100+ MB; gitignored)
- Re-download with: `python tools/install_renode.py --force`
- Details: `tools/renode/README.md`

**Alternative:** install Renode from [renode.io](https://renode.io/) / GitHub releases, then either:

- leave it on PATH, or
- set `RENODE_PATH` to the `renode` / `renode.exe` binary, or
- use the default Windows path `C:\Program Files\Renode\renode.exe`

StudioMCU resolves Renode in this order: `RENODE_PATH` → `tools/renode/` → Program Files → PATH.

Board overlay scripts that *are* committed live in `simulation/`:

- `simulation/nucleo_f446re.repl`
- `simulation/run_template.resc`

### 5. ST-Link tools (hardware only)

For **Hardware** mode, install OpenOCD/`stlink` tools so `st-flash` and `st-info` work with your NUCLEO-F446RE.

## Run

```bash
python studiomcu_launcher.py
```

Or:

```bash
python app/main.py
```

Open [http://localhost:8000](http://localhost:8000).

### Simulation vs Hardware

1. Top bar: choose **Simulation** or **Hardware**.
2. Open a lesson → **Build**.
3. **Simulation:** click **Run simulation**. Watch LD2 on the board GUI, tap B1, use Serial Monitor for USART2.
4. **Hardware:** connect the Nucleo via USB, click **Flash**, use Serial Monitor on the ST-Link VCP COM port.

**Simulates well:** GPIO LED / BSRR, button + LED, SysTick blink, USART2 hello/echo.  
**Limited in Renode F4 model:** SPI, I2C, ADC, TIM PWM.

## Package as a single .exe (Windows)

Build a portable package with PyInstaller. The `.exe` embeds the Python app; **lessons/** and **static/** stay outside so you can edit UI/lessons without rebuilding.

```powershell
.venv\Scripts\Activate.ps1
pip install pyinstaller pillow
python tools/build_exe.py
```

Output folder:

```
dist/StudioMCU/
  StudioMCU.exe      ← double-click to run (opens the browser)
  lessons/           ← edit anytime
  static/            ← edit anytime (includes logo)
  firmware/
  simulation/
  README_RUNTIME.txt
```

Copy the whole `dist/StudioMCU/` folder to another PC. Keep `lessons/` and `static/` next to the exe.

Logo assets: `static/img/logo.png` (web) and `assets/studiomcu.ico` (exe icon).

## Adding lessons

Place files under `lessons/`:

- `lesson-id.txt` — starter code  
- `lesson-id_solution.txt` — solution  

Then register the lesson in `app/lessons.py`.

## Project layout (simulation-related)

```
simulation/           # Nucleo platform + Renode .resc template (tracked)
tools/install_renode.py
tools/renode/         # Portable Renode runtime (downloaded; gitignored)
app/renode_sim.py     # Renode process + LED / button / UART bridge
requirements.txt      # Python deps + Renode install notes
```
