/**
  ******************************************************************************
  * @file    stm32f4xx_ll_adc.h
  * @brief   Teaching subset of ST LL ADC APIs (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_ADC_H
#define STM32F4XX_LL_ADC_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

#define LL_ADC_CHANNEL_0                   0x00000000U

__STATIC_INLINE void LL_ADC_Enable(ADC_TypeDef *ADCx)
{
  SET_BIT(ADCx->CR2, ADC_CR2_ADON);
}

__STATIC_INLINE void LL_ADC_REG_SetSequencerRanks(ADC_TypeDef *ADCx, uint32_t Channel)
{
  WRITE_REG(ADCx->SQR3, (Channel << ADC_SQR3_SQ1_Pos));
}

__STATIC_INLINE void LL_ADC_REG_StartConversionSWStart(ADC_TypeDef *ADCx)
{
  SET_BIT(ADCx->CR2, ADC_CR2_SWSTART);
}

__STATIC_INLINE uint32_t LL_ADC_IsActiveFlag_EOCS(ADC_TypeDef *ADCx)
{
  return ((READ_BIT(ADCx->SR, ADC_SR_EOC) == ADC_SR_EOC) ? 1UL : 0UL);
}

__STATIC_INLINE uint32_t LL_ADC_REG_ReadConversionData12(ADC_TypeDef *ADCx)
{
  return (uint32_t)(READ_REG(ADCx->DR) & 0xFFFU);
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_ADC_H */
