/**
  ******************************************************************************
  * @file    stm32f4xx_hal_gpio.h
  * @brief   Teaching subset of ST HAL GPIO driver (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_HAL_GPIO_H
#define STM32F4XX_HAL_GPIO_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx_hal_def.h"

#define GPIO_PIN_0                 ((uint16_t)0x0001)
#define GPIO_PIN_1                 ((uint16_t)0x0002)
#define GPIO_PIN_2                 ((uint16_t)0x0004)
#define GPIO_PIN_3                 ((uint16_t)0x0008)
#define GPIO_PIN_4                 ((uint16_t)0x0010)
#define GPIO_PIN_5                 ((uint16_t)0x0020)
#define GPIO_PIN_6                 ((uint16_t)0x0040)
#define GPIO_PIN_7                 ((uint16_t)0x0080)
#define GPIO_PIN_8                 ((uint16_t)0x0100)
#define GPIO_PIN_9                 ((uint16_t)0x0200)
#define GPIO_PIN_10                ((uint16_t)0x0400)
#define GPIO_PIN_11                ((uint16_t)0x0800)
#define GPIO_PIN_12                ((uint16_t)0x1000)
#define GPIO_PIN_13                ((uint16_t)0x2000)
#define GPIO_PIN_14                ((uint16_t)0x4000)
#define GPIO_PIN_15                ((uint16_t)0x8000)
#define GPIO_PIN_All               ((uint16_t)0xFFFF)

#define GPIO_MODE_INPUT            0x00000000U
#define GPIO_MODE_OUTPUT_PP        0x00000001U
#define GPIO_MODE_OUTPUT_OD        0x00000011U
#define GPIO_MODE_AF_PP            0x00000002U
#define GPIO_MODE_AF_OD            0x00000012U
#define GPIO_MODE_ANALOG           0x00000003U

#define GPIO_NOPULL                0x00000000U
#define GPIO_PULLUP                0x00000001U
#define GPIO_PULLDOWN              0x00000002U

#define GPIO_SPEED_FREQ_LOW        0x00000000U
#define GPIO_SPEED_FREQ_MEDIUM     0x00000001U
#define GPIO_SPEED_FREQ_HIGH       0x00000002U
#define GPIO_SPEED_FREQ_VERY_HIGH  0x00000003U

#define GPIO_AF0_MCO               ((uint8_t)0x00)
#define GPIO_AF1_TIM1              ((uint8_t)0x01)
#define GPIO_AF1_TIM2              ((uint8_t)0x01)
#define GPIO_AF4_I2C1              ((uint8_t)0x04)
#define GPIO_AF5_SPI1              ((uint8_t)0x05)
#define GPIO_AF7_USART1            ((uint8_t)0x07)
#define GPIO_AF7_USART2            ((uint8_t)0x07)

typedef enum {
  GPIO_PIN_RESET = 0,
  GPIO_PIN_SET
} GPIO_PinState;

typedef struct {
  uint32_t Pin;
  uint32_t Mode;
  uint32_t Pull;
  uint32_t Speed;
  uint32_t Alternate;
} GPIO_InitTypeDef;

#define __HAL_RCC_GPIOA_CLK_ENABLE()  do { SET_BIT(RCC->AHB1ENR, RCC_AHB1ENR_GPIOAEN); \
                                          (void)READ_BIT(RCC->AHB1ENR, RCC_AHB1ENR_GPIOAEN); } while (0)
#define __HAL_RCC_GPIOB_CLK_ENABLE()  do { SET_BIT(RCC->AHB1ENR, RCC_AHB1ENR_GPIOBEN); \
                                          (void)READ_BIT(RCC->AHB1ENR, RCC_AHB1ENR_GPIOBEN); } while (0)
#define __HAL_RCC_GPIOC_CLK_ENABLE()  do { SET_BIT(RCC->AHB1ENR, RCC_AHB1ENR_GPIOCEN); \
                                          (void)READ_BIT(RCC->AHB1ENR, RCC_AHB1ENR_GPIOCEN); } while (0)
#define __HAL_RCC_USART1_CLK_ENABLE() do { SET_BIT(RCC->APB2ENR, RCC_APB2ENR_USART1EN); \
                                          (void)READ_BIT(RCC->APB2ENR, RCC_APB2ENR_USART1EN); } while (0)
#define __HAL_RCC_USART2_CLK_ENABLE() do { SET_BIT(RCC->APB1ENR, RCC_APB1ENR_USART2EN); \
                                          (void)READ_BIT(RCC->APB1ENR, RCC_APB1ENR_USART2EN); } while (0)
#define __HAL_RCC_SPI1_CLK_ENABLE()   do { SET_BIT(RCC->APB2ENR, RCC_APB2ENR_SPI1EN); \
                                          (void)READ_BIT(RCC->APB2ENR, RCC_APB2ENR_SPI1EN); } while (0)
#define __HAL_RCC_TIM2_CLK_ENABLE()   do { SET_BIT(RCC->APB1ENR, RCC_APB1ENR_TIM2EN); \
                                          (void)READ_BIT(RCC->APB1ENR, RCC_APB1ENR_TIM2EN); } while (0)
#define __HAL_RCC_ADC1_CLK_ENABLE()   do { SET_BIT(RCC->APB2ENR, RCC_APB2ENR_ADC1EN); \
                                          (void)READ_BIT(RCC->APB2ENR, RCC_APB2ENR_ADC1EN); } while (0)
#define __HAL_RCC_I2C1_CLK_ENABLE()   do { SET_BIT(RCC->APB1ENR, RCC_APB1ENR_I2C1EN); \
                                          (void)READ_BIT(RCC->APB1ENR, RCC_APB1ENR_I2C1EN); } while (0)

void HAL_GPIO_Init(GPIO_TypeDef *GPIOx, GPIO_InitTypeDef *GPIO_Init);
void HAL_GPIO_WritePin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState);
void HAL_GPIO_TogglePin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin);
GPIO_PinState HAL_GPIO_ReadPin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin);

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_HAL_GPIO_H */
