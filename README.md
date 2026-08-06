# StudioMCU

A FastAPI web app for learning STM32F446RE (NUCLEO-F446RE) embedded C with a VS Code–style browser IDE.

## Features

- Lesson starters and solutions live in `lessons/` as separate text files
- CMSIS-style device header in `firmware/stm32f446xe.h` (structs, base addresses, bit macros)
- Monaco editor, build with `arm-none-eabi-gcc`, flash with `st-flash`
- Serial monitor via `pyserial`
- Sidebar activity bar: Lessons, Firmware reference (read-only), Board info

## Lessons included

1. GPIO LED blink  
2. GPIO BSRR atomic set/reset  
3. User button + LED  
4. SysTick millisecond delay  
5. USART2 serial hello (ST-Link VCP)  
6. USART2 echo  
7. USART1 external UART  
8. SPI1 master loopback  
9. SPI1 slave client  
10. TIM2 PWM brightness  
11. ADC1 read + serial print  
12. I2C1 bus scan  

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
- Lessons use register-level programming with ST-style CMSIS names (`GPIOA->AFR[0]`, `RCC_AHB1ENR_GPIOAEN`, …).
- Build/flash need the native toolchain installed.
