# StudioMCU

A FastAPI web app for learning STM32F446RE (NUCLEO-F446RE) embedded C with a VS Code–style browser IDE.

## Features

- Lesson starters and solutions live in `lessons/` as separate text files
- ST-style firmware pack in `firmware/`:
  - CMSIS device header (`stm32f446xe.h` / `stm32f4xx.h`)
  - Compact **HAL** teaching subset (`stm32f4xx_hal*.h/.c`)
  - Compact **LL** teaching subset (`stm32f4xx_ll_*.h`)
- Monaco editor, build with `arm-none-eabi-gcc`, flash with `st-flash`
- Serial monitor via `pyserial`
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

## Setup

1. Install Python 3.11+
2. Create a virtualenv and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install fastapi "uvicorn[standard]" pyserial
   ```
3. Install ARM tools on PATH (or under `toolchain/`):
   - `arm-none-eabi-gcc`
   - `arm-none-eabi-objcopy`
   - `st-flash` / `st-info`

## Run

```bash
python app/main.py
```

Open `http://localhost:8000`.

## Adding lessons

Place files under `lessons/`:

- `lesson-id.txt` — starter code  
- `lesson-id_solution.txt` — solution  

Then register the lesson in `app/lessons.py`.

## Notes

- Target board is **NUCLEO-F446RE** (STM32F446RE).
- Default clock assumption is **16 MHz HSI** (Nucleo reset default).
- Build/flash need the native toolchain installed.
