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
        "title": "01 · Blink the Nucleo LED",
        "summary": "Drive LD2 on PA5 using GPIO output mode and CMSIS register macros.",
        "steps": [
            "Enable the GPIOA clock in RCC->AHB1ENR.",
            "Set PA5 to general-purpose output mode in GPIOA->MODER.",
            "Toggle the LED with a visible delay loop.",
        ],
        "hint": "LD2 is PA5. Use RCC_AHB1ENR_GPIOAEN, GPIO_MODER_MODE5_OUTPUT, and GPIO_ODR_OD5.",
        "starter_file": "gpio-led.txt",
        "solution_file": "gpio-led_solution.txt",
    },
    {
        "id": "gpio-bsrr",
        "title": "02 · Atomic GPIO with BSRR",
        "summary": "Set and clear PA5 using BSRR instead of read-modify-write on ODR.",
        "steps": [
            "Enable GPIOA and configure PA5 as an output.",
            "Use GPIO_BSRR_BS5 to turn the LED on.",
            "Use GPIO_BSRR_BR5 to turn the LED off.",
        ],
        "hint": "BSRR high bits reset pins. Writing 1 << (pin + 16) clears that pin.",
        "starter_file": "gpio-bsrr.txt",
        "solution_file": "gpio-bsrr_solution.txt",
    },
    {
        "id": "button-led",
        "title": "03 · User Button and LED",
        "summary": "Read the user button on PC13 and toggle LD2 when it is pressed.",
        "steps": [
            "Enable GPIOA and GPIOC clocks.",
            "Set PA5 to push-pull output and leave PC13 as input.",
            "Poll PC13 and toggle the LED when the button is pressed.",
        ],
        "hint": "On NUCLEO-F446RE the user button is PC13 and reads low when pressed.",
        "starter_file": "button-led.txt",
        "solution_file": "button-led_solution.txt",
    },
    {
        "id": "systick-blink",
        "title": "04 · SysTick Millisecond Delay",
        "summary": "Blink LD2 using the Cortex-M SysTick timer for accurate delays.",
        "steps": [
            "Configure PA5 as an output.",
            "Program SysTick LOAD/VAL/CTRL for a 1 ms tick at 16 MHz.",
            "Wait on COUNTFLAG inside a delay_ms helper.",
        ],
        "hint": "LOAD = 16000 - 1 gives a 1 ms period with the 16 MHz HSI clock.",
        "starter_file": "systick-blink.txt",
        "solution_file": "systick-blink_solution.txt",
    },
    {
        "id": "uart-hello",
        "title": "05 · USB Serial Hello",
        "summary": "Send text over USART2 through the NUCLEO virtual COM port.",
        "steps": [
            "Enable clocks for GPIOA and USART2.",
            "Configure PA2 for USART2 TX using AFR[0] AF7.",
            "Set baud rate 115200 and enable TX.",
            "Transmit a hello string over serial.",
        ],
        "hint": "Use GPIOA->AFR[0] for AF7, then enable USART2 with TE | UE.",
        "starter_file": "uart-hello.txt",
        "solution_file": "uart-hello_solution.txt",
    },
    {
        "id": "uart-echo",
        "title": "06 · UART Echo",
        "summary": "Echo characters received on USART2 back to the host.",
        "steps": [
            "Enable GPIOA and USART2 clocks.",
            "Configure PA2 and PA3 for AF7.",
            "Enable RX and TX in USART2.",
            "Read each incoming byte and send it back.",
        ],
        "hint": "Enable RE as well as TE, then mirror bytes when USART_SR_RXNE is set.",
        "starter_file": "uart-echo.txt",
        "solution_file": "uart-echo_solution.txt",
    },
    {
        "id": "uart-cross",
        "title": "07 · External UART on USART1",
        "summary": "Talk to another UART device on PA9/PA10 using USART1.",
        "steps": [
            "Enable GPIOA and USART1 clocks.",
            "Configure PA9 (TX) and PA10 (RX) as AF7 via AFR[1].",
            "Set 9600 baud and enable TE | RE | UE.",
            "Echo bytes from the external UART device.",
        ],
        "hint": "Share grounds with the other device. AFR[1] covers pins 8-15.",
        "starter_file": "uart-cross.txt",
        "solution_file": "uart-cross_solution.txt",
    },
    {
        "id": "spi-loopback",
        "title": "08 · SPI Master Loopback",
        "summary": "Configure SPI1 master and transfer bytes in loopback mode.",
        "steps": [
            "Enable GPIOA and SPI1 clocks.",
            "Configure PA5/PA6/PA7 for AF5.",
            "Set SPI1 to master mode with software slave management.",
            "Send a byte and read the response from SPI1->DR.",
        ],
        "hint": "Short MOSI to MISO for loopback. Check TXE before write and RXNE before read.",
        "starter_file": "spi-loopback.txt",
        "solution_file": "spi-loopback_solution.txt",
    },
    {
        "id": "spi-client",
        "title": "09 · SPI Slave Client",
        "summary": "Build an SPI1 client that waits for an external master to send bytes.",
        "steps": [
            "Enable GPIOA and SPI1 clocks.",
            "Configure PA5/PA6/PA7 for AF5.",
            "Put SPI1 into slave mode with software slave-management.",
            "Read received bytes from SPI1->DR.",
        ],
        "hint": "Leave MSTR clear. An external master must clock SCK while driving MOSI.",
        "starter_file": "spi-client.txt",
        "solution_file": "spi-client_solution.txt",
    },
    {
        "id": "timer-pwm",
        "title": "10 · Timer PWM Brightness",
        "summary": "Drive LD2 with TIM2 PWM on PA5 to control brightness.",
        "steps": [
            "Enable GPIOA and TIM2 clocks.",
            "Set PA5 to AF1 for TIM2_CH1.",
            "Configure PSC, ARR, CCMR1 PWM mode 1, and enable CC1E + CEN.",
            "Write CCR1 to change duty cycle.",
        ],
        "hint": "CCR1 between 0 and ARR sets the duty cycle. Try 100, 500, and 900.",
        "starter_file": "timer-pwm.txt",
        "solution_file": "timer-pwm_solution.txt",
    },
    {
        "id": "adc-read",
        "title": "11 · ADC Channel Read",
        "summary": "Read an analog voltage on PA0 with ADC1 and print it over USART2.",
        "steps": [
            "Initialize USART2 for serial output.",
            "Set PA0 to analog mode and enable ADC1.",
            "Select channel 0, start conversion, wait for EOC.",
            "Print the 12-bit result to the serial monitor.",
        ],
        "hint": "Connect a potentiometer or 0-3.3 V signal to Arduino A0 (PA0).",
        "starter_file": "adc-read.txt",
        "solution_file": "adc-read_solution.txt",
    },
    {
        "id": "i2c-scan",
        "title": "12 · I2C Bus Scan",
        "summary": "Initialize I2C1 on PB8/PB9 and probe for ACK responses.",
        "steps": [
            "Enable GPIOB and I2C1 clocks.",
            "Configure PB8/PB9 as open-drain AF4.",
            "Program CCR/TRISE for ~100 kHz and enable PE.",
            "Generate START, send each 7-bit address, and check the ADDR flag.",
        ],
        "hint": "External pull-ups help on a real bus. On Nucleo, enable internal pull-ups for a quick test.",
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
