/**
  ******************************************************************************
  * @file    stm32f4xx_ll_bus.h
  * @brief   Teaching subset of ST LL BUS (RCC clock enable) APIs.
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_BUS_H
#define STM32F4XX_LL_BUS_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

#define LL_AHB1_GRP1_PERIPH_GPIOA   RCC_AHB1ENR_GPIOAEN
#define LL_AHB1_GRP1_PERIPH_GPIOB   RCC_AHB1ENR_GPIOBEN
#define LL_AHB1_GRP1_PERIPH_GPIOC   RCC_AHB1ENR_GPIOCEN

#define LL_APB1_GRP1_PERIPH_TIM2    RCC_APB1ENR_TIM2EN
#define LL_APB1_GRP1_PERIPH_TIM3    RCC_APB1ENR_TIM3EN
#define LL_APB1_GRP1_PERIPH_USART2  RCC_APB1ENR_USART2EN
#define LL_APB1_GRP1_PERIPH_I2C1    RCC_APB1ENR_I2C1EN

#define LL_APB2_GRP1_PERIPH_USART1  RCC_APB2ENR_USART1EN
#define LL_APB2_GRP1_PERIPH_ADC1    RCC_APB2ENR_ADC1EN
#define LL_APB2_GRP1_PERIPH_SPI1    RCC_APB2ENR_SPI1EN
#define LL_APB2_GRP1_PERIPH_SYSCFG  RCC_APB2ENR_SYSCFGEN

__STATIC_INLINE void LL_AHB1_GRP1_EnableClock(uint32_t Periphs)
{
  SET_BIT(RCC->AHB1ENR, Periphs);
  (void)READ_BIT(RCC->AHB1ENR, Periphs);
}

__STATIC_INLINE void LL_APB1_GRP1_EnableClock(uint32_t Periphs)
{
  SET_BIT(RCC->APB1ENR, Periphs);
  (void)READ_BIT(RCC->APB1ENR, Periphs);
}

__STATIC_INLINE void LL_APB2_GRP1_EnableClock(uint32_t Periphs)
{
  SET_BIT(RCC->APB2ENR, Periphs);
  (void)READ_BIT(RCC->APB2ENR, Periphs);
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_BUS_H */
