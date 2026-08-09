/**
  ******************************************************************************
  * @file    stm32f4xx_ll_utils.h
  * @brief   Teaching subset of ST LL utility delay helpers.
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_UTILS_H
#define STM32F4XX_LL_UTILS_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

__STATIC_INLINE void LL_Init1msTick(uint32_t HCLKFrequency)
{
  SysTick->LOAD = (HCLKFrequency / 1000U) - 1U;
  SysTick->VAL = 0U;
  SysTick->CTRL = SysTick_CTRL_CLKSOURCE_Msk | SysTick_CTRL_ENABLE_Msk;
}

__STATIC_INLINE void LL_mDelay(uint32_t Delay)
{
  __IO uint32_t tmp = SysTick->CTRL;
  (void)tmp;

  while (Delay != 0U)
  {
    if ((SysTick->CTRL & SysTick_CTRL_COUNTFLAG_Msk) != 0U)
    {
      Delay--;
    }
  }
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_UTILS_H */
