/**
  ******************************************************************************
  * @file    stm32f4xx_ll_tim.h
  * @brief   Teaching subset of ST LL TIM APIs (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_TIM_H
#define STM32F4XX_LL_TIM_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

#define LL_TIM_OCMODE_PWM1                 TIM_CCMR1_OC1M_PWM1

__STATIC_INLINE void LL_TIM_EnableCounter(TIM_TypeDef *TIMx)
{
  SET_BIT(TIMx->CR1, TIM_CR1_CEN);
}

__STATIC_INLINE void LL_TIM_DisableCounter(TIM_TypeDef *TIMx)
{
  CLEAR_BIT(TIMx->CR1, TIM_CR1_CEN);
}

__STATIC_INLINE void LL_TIM_EnableARRPreload(TIM_TypeDef *TIMx)
{
  SET_BIT(TIMx->CR1, TIM_CR1_ARPE);
}

__STATIC_INLINE void LL_TIM_SetPrescaler(TIM_TypeDef *TIMx, uint32_t Prescaler)
{
  WRITE_REG(TIMx->PSC, Prescaler);
}

__STATIC_INLINE void LL_TIM_SetAutoReload(TIM_TypeDef *TIMx, uint32_t AutoReload)
{
  WRITE_REG(TIMx->ARR, AutoReload);
}

__STATIC_INLINE void LL_TIM_OC_SetMode(TIM_TypeDef *TIMx, uint32_t Mode)
{
  MODIFY_REG(TIMx->CCMR1, (0x7U << TIM_CCMR1_OC1M_Pos), Mode);
}

__STATIC_INLINE void LL_TIM_OC_EnablePreload(TIM_TypeDef *TIMx)
{
  SET_BIT(TIMx->CCMR1, TIM_CCMR1_OC1PE);
}

__STATIC_INLINE void LL_TIM_CC_EnableChannel(TIM_TypeDef *TIMx)
{
  SET_BIT(TIMx->CCER, TIM_CCER_CC1E);
}

__STATIC_INLINE void LL_TIM_OC_SetCompareCH1(TIM_TypeDef *TIMx, uint32_t CompareValue)
{
  WRITE_REG(TIMx->CCR1, CompareValue);
}

__STATIC_INLINE void LL_TIM_GenerateEvent_UPDATE(TIM_TypeDef *TIMx)
{
  SET_BIT(TIMx->EGR, TIM_EGR_UG);
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_TIM_H */
