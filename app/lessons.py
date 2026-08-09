from pathlib import Path
from typing import List, TypedDict


class Lesson(TypedDict):
    id: str
    title: str
    summary: str
    steps: List[str]
    starter_code: str
    solution_code: str
    hint: str


LESSON_FOLDER = Path(__file__).resolve().parent.parent / "lessons"

LESSON_DEFINITIONS: List[dict] = [
    {
        "id": "gpio-led",
        "title": "01 · Blink the Nucleo LED (HAL)",
        "summary": "Drive LD2 on PA5 using ST HAL GPIO APIs (HAL_GPIO_Init / TogglePin).",
        "steps": [
            "Call HAL_Init() to start the 1 ms SysTick used by HAL_Delay().",
            "Enable the GPIOA clock with __HAL_RCC_GPIOA_CLK_ENABLE().",
            "Fill a GPIO_InitTypeDef for PA5 as GPIO_MODE_OUTPUT_PP.",
            "Toggle LD2 with HAL_GPIO_TogglePin() and HAL_Delay(500).",
        ],
        "hint": "Use GPIO_PIN_5, GPIO_MODE_OUTPUT_PP, and HAL_GPIO_Init(GPIOA, &GPIO_InitStruct).",
        "starter_file": "gpio-led.txt",
        "solution_file": "gpio-led_solution.txt",
    },
    {
        "id": "gpio-bsrr",
        "title": "02 · Atomic GPIO with WritePin (HAL)",
        "summary": "Set and clear PA5 using HAL_GPIO_WritePin (BSRR under the hood).",
        "steps": [
            "Call HAL_Init() and enable the GPIOA clock.",
            "Configure PA5 as a push-pull output with HAL_GPIO_Init().",
            "Turn the LED on with HAL_GPIO_WritePin(..., GPIO_PIN_SET).",
            "Turn the LED off with HAL_GPIO_WritePin(..., GPIO_PIN_RESET).",
        ],
        "hint": "HAL_GPIO_WritePin uses BSRR. GPIO_PIN_SET writes the low half; GPIO_PIN_RESET writes the high half.",
        "starter_file": "gpio-bsrr.txt",
        "solution_file": "gpio-bsrr_solution.txt",
    },
    {
        "id": "button-led",
        "title": "03 · User Button and LED (HAL)",
        "summary": "Read PC13 with HAL_GPIO_ReadPin and toggle LD2 when pressed.",
        "steps": [
            "Enable GPIOA and GPIOC clocks.",
            "Configure PA5 as output and PC13 as input.",
            "Poll HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13).",
            "When the pin is GPIO_PIN_SET (pressed), toggle LD2.",
        ],
        "hint": "Poll PC13 with HAL_GPIO_ReadPin and compare against GPIO_PIN_SET when pressed.",
        "starter_file": "button-led.txt",
        "solution_file": "button-led_solution.txt",
    },
    {
        "id": "systick-blink",
        "title": "04 · SysTick Delay with HAL_Delay",
        "summary": "Blink LD2 using HAL_Init() + HAL_Delay() (official HAL timing style).",
        "steps": [
            "Call HAL_Init() to program SysTick for 1 ms ticks.",
            "Configure PA5 as a push-pull output.",
            "Blink with HAL_GPIO_TogglePin() and HAL_Delay(500).",
        ],
        "hint": "HAL_Init() enables SysTick interrupts; HAL_Delay() waits on HAL_GetTick().",
        "starter_file": "systick-blink.txt",
        "solution_file": "systick-blink_solution.txt",
    },
    {
        "id": "uart-hello",
        "title": "05 · USB Serial Hello (LL)",
        "summary": "Send text over USART2 using ST Low-Layer USART APIs.",
        "steps": [
            "Enable clocks with LL_AHB1_GRP1_EnableClock / LL_APB1_GRP1_EnableClock.",
            "Configure PA2 as AF7 with LL_GPIO_SetPinMode / SetAFPin_0_7.",
            "Set baud rate and TX direction, then LL_USART_Enable().",
            "Transmit with LL_USART_TransmitData8() while waiting on TXE.",
        ],
        "hint": "Include stm32f4xx_ll_bus.h, stm32f4xx_ll_gpio.h, and stm32f4xx_ll_usart.h.",
        "starter_file": "uart-hello.txt",
        "solution_file": "uart-hello_solution.txt",
    },
    {
        "id": "uart-echo",
        "title": "06 · UART Echo (LL)",
        "summary": "Echo USART2 RX bytes using LL_USART_ReceiveData8 / TransmitData8.",
        "steps": [
            "Enable GPIOA and USART2 clocks.",
            "Configure PA2 and PA3 as AF7.",
            "Enable TX+RX with LL_USART_DIRECTION_TX_RX.",
            "When RXNE is set, echo the received byte.",
        ],
        "hint": "Use LL_USART_IsActiveFlag_RXNE() and LL_USART_IsActiveFlag_TXE().",
        "starter_file": "uart-echo.txt",
        "solution_file": "uart-echo_solution.txt",
    },
    {
        "id": "uart-cross",
        "title": "07 · External UART on USART1 (LL)",
        "summary": "Talk to another UART device on PA9/PA10 using LL USART1 APIs.",
        "steps": [
            "Enable GPIOA and USART1 clocks.",
            "Configure PA9/PA10 as AF7 with LL_GPIO_SetAFPin_8_15().",
            "Set 9600 baud and enable TX+RX.",
            "Echo bytes from the external UART device.",
        ],
        "hint": "Share grounds with the other device. Pins 8-15 use AFR[1] helpers.",
        "starter_file": "uart-cross.txt",
        "solution_file": "uart-cross_solution.txt",
    },
    {
        "id": "spi-loopback",
        "title": "08 · SPI Master Loopback (LL)",
        "summary": "Configure SPI1 master with LL APIs and transfer bytes in loopback.",
        "steps": [
            "Enable GPIOA and SPI1 clocks.",
            "Configure PA5/PA6/PA7 as AF5.",
            "Set master mode + soft NSS, then LL_SPI_Enable().",
            "Transfer with LL_SPI_TransmitData8 / ReceiveData8.",
        ],
        "hint": "Short MOSI to MISO. Wait on TXE before write and RXNE before read.",
        "starter_file": "spi-loopback.txt",
        "solution_file": "spi-loopback_solution.txt",
    },
    {
        "id": "spi-client",
        "title": "09 · SPI Slave Client (LL)",
        "summary": "Build an SPI1 slave that waits for an external master using LL APIs.",
        "steps": [
            "Enable GPIOA and SPI1 clocks.",
            "Configure PA5/PA6/PA7 as AF5.",
            "Leave SPI1 in LL_SPI_MODE_SLAVE with soft NSS.",
            "Read received bytes when RXNE is set.",
        ],
        "hint": "Do not set LL_SPI_MODE_MASTER. An external master must clock SCK.",
        "starter_file": "spi-client.txt",
        "solution_file": "spi-client_solution.txt",
    },
    {
        "id": "timer-pwm",
        "title": "10 · Timer PWM Brightness (LL)",
        "summary": "Drive LD2 with TIM2 PWM on PA5 using ST LL TIM APIs.",
        "steps": [
            "Enable GPIOA and TIM2 clocks.",
            "Set PA5 to AF1 for TIM2_CH1.",
            "Configure PSC/ARR, PWM mode 1, enable channel + counter.",
            "Write the duty cycle with LL_TIM_OC_SetCompareCH1().",
        ],
        "hint": "CCR1 between 0 and ARR sets duty cycle. Try 100, 500, and 900.",
        "starter_file": "timer-pwm.txt",
        "solution_file": "timer-pwm_solution.txt",
    },
    {
        "id": "adc-read",
        "title": "11 · ADC Channel Read (LL)",
        "summary": "Read PA0 with LL ADC APIs and print the result over USART2.",
        "steps": [
            "Initialize USART2 with LL USART helpers.",
            "Set PA0 to analog mode and enable ADC1.",
            "Start conversion, wait for EOCS, read 12-bit data.",
            "Print the result to the serial monitor.",
        ],
        "hint": "Connect a potentiometer or 0-3.3 V signal to Arduino A0 (PA0).",
        "starter_file": "adc-read.txt",
        "solution_file": "adc-read_solution.txt",
    },
    {
        "id": "i2c-scan",
        "title": "12 · I2C Bus Scan (LL)",
        "summary": "Initialize I2C1 on PB8/PB9 with LL APIs and probe for ACK responses.",
        "steps": [
            "Enable GPIOB and I2C1 clocks.",
            "Configure PB8/PB9 as open-drain AF4 with pull-ups.",
            "Program CCR/TRISE for ~100 kHz and enable PE.",
            "Generate START, send each 7-bit address, and check the ADDR flag.",
        ],
        "hint": "Use LL_I2C_GenerateStartCondition / IsActiveFlag_ADDR / ClearFlag_ADDR.",
        "starter_file": "i2c-scan.txt",
        "solution_file": "i2c-scan_solution.txt",
    },
]


def _read_file(filename: str) -> str:
    try:
        return (LESSON_FOLDER / filename).read_text(encoding="utf-8")
    except FileNotFoundError:
        return f"// Lesson file missing: {filename}\n"


def _build_lesson(definition: dict) -> Lesson:
    return {
        "id": definition["id"],
        "title": definition["title"],
        "summary": definition["summary"],
        "steps": definition["steps"],
        "hint": definition["hint"],
        "starter_code": _read_file(definition["starter_file"]),
        "solution_code": _read_file(definition["solution_file"]),
    }


def list_lessons() -> List[Lesson]:
    return [_build_lesson(definition) for definition in LESSON_DEFINITIONS]


def get_lesson(lesson_id: str) -> Lesson | None:
    definition = next((item for item in LESSON_DEFINITIONS if item["id"] == lesson_id), None)
    if definition is None:
        return None
    return _build_lesson(definition)


# Backwards-compatible snapshot for imports that still expect `lessons`.
lessons = list_lessons()
