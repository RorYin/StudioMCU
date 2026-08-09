/**
  ******************************************************************************
  * @file    stm32f4xx_hal.h
  * @brief   Teaching subset of ST STM32F4 HAL (Cube-style entry header).
  ******************************************************************************
  */
#ifndef STM32F4XX_HAL_H
#define STM32F4XX_HAL_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx_hal_def.h"
#include "stm32f4xx_hal_gpio.h"

HAL_StatusTypeDef HAL_Init(void);
void HAL_IncTick(void);
uint32_t HAL_GetTick(void);
void HAL_Delay(uint32_t Delay);
void SysTick_Handler(void);

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_HAL_H */
