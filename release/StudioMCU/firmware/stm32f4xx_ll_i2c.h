/**
  ******************************************************************************
  * @file    stm32f4xx_ll_i2c.h
  * @brief   Teaching subset of ST LL I2C APIs (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_I2C_H
#define STM32F4XX_LL_I2C_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

__STATIC_INLINE void LL_I2C_Enable(I2C_TypeDef *I2Cx)
{
  SET_BIT(I2Cx->CR1, I2C_CR1_PE);
}

__STATIC_INLINE void LL_I2C_Disable(I2C_TypeDef *I2Cx)
{
  CLEAR_BIT(I2Cx->CR1, I2C_CR1_PE);
}

__STATIC_INLINE void LL_I2C_SetPeriphClock(I2C_TypeDef *I2Cx, uint32_t PeriphClock)
{
  MODIFY_REG(I2Cx->CR2, 0x3FU, PeriphClock);
}

__STATIC_INLINE void LL_I2C_SetClockPeriod(I2C_TypeDef *I2Cx, uint32_t ClockPeriod)
{
  WRITE_REG(I2Cx->CCR, ClockPeriod);
}

__STATIC_INLINE void LL_I2C_SetRiseTime(I2C_TypeDef *I2Cx, uint32_t RiseTime)
{
  WRITE_REG(I2Cx->TRISE, RiseTime);
}

__STATIC_INLINE void LL_I2C_GenerateStartCondition(I2C_TypeDef *I2Cx)
{
  SET_BIT(I2Cx->CR1, I2C_CR1_START);
}

__STATIC_INLINE void LL_I2C_GenerateStopCondition(I2C_TypeDef *I2Cx)
{
  SET_BIT(I2Cx->CR1, I2C_CR1_STOP);
}

__STATIC_INLINE void LL_I2C_TransmitData8(I2C_TypeDef *I2Cx, uint8_t Data)
{
  WRITE_REG(I2Cx->DR, Data);
}

__STATIC_INLINE uint32_t LL_I2C_IsActiveFlag_SB(I2C_TypeDef *I2Cx)
{
  return ((READ_BIT(I2Cx->SR1, I2C_SR1_SB) == I2C_SR1_SB) ? 1UL : 0UL);
}

__STATIC_INLINE uint32_t LL_I2C_IsActiveFlag_ADDR(I2C_TypeDef *I2Cx)
{
  return ((READ_BIT(I2Cx->SR1, I2C_SR1_ADDR) == I2C_SR1_ADDR) ? 1UL : 0UL);
}

__STATIC_INLINE void LL_I2C_ClearFlag_ADDR(I2C_TypeDef *I2Cx)
{
  (void)I2Cx->SR1;
  (void)I2Cx->SR2;
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_I2C_H */
