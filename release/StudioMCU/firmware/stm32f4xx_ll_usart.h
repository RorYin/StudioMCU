/**
  ******************************************************************************
  * @file    stm32f4xx_ll_usart.h
  * @brief   Teaching subset of ST LL USART APIs (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_USART_H
#define STM32F4XX_LL_USART_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

#define LL_USART_DIRECTION_NONE            0x00000000U
#define LL_USART_DIRECTION_RX              USART_CR1_RE
#define LL_USART_DIRECTION_TX              USART_CR1_TE
#define LL_USART_DIRECTION_TX_RX           (USART_CR1_TE | USART_CR1_RE)

__STATIC_INLINE void LL_USART_Enable(USART_TypeDef *USARTx)
{
  SET_BIT(USARTx->CR1, USART_CR1_UE);
}

__STATIC_INLINE void LL_USART_Disable(USART_TypeDef *USARTx)
{
  CLEAR_BIT(USARTx->CR1, USART_CR1_UE);
}

__STATIC_INLINE void LL_USART_SetTransferDirection(USART_TypeDef *USARTx, uint32_t TransferDirection)
{
  MODIFY_REG(USARTx->CR1, USART_CR1_RE | USART_CR1_TE, TransferDirection);
}

__STATIC_INLINE void LL_USART_SetBaudRate(USART_TypeDef *USARTx, uint32_t PeriphClk, uint32_t BaudRate)
{
  /* Simplified BRR for 16x oversampling: BRR = PeriphClk / BaudRate */
  USARTx->BRR = (uint16_t)((PeriphClk + (BaudRate / 2U)) / BaudRate);
}

__STATIC_INLINE void LL_USART_TransmitData8(USART_TypeDef *USARTx, uint8_t Value)
{
  USARTx->DR = Value;
}

__STATIC_INLINE uint8_t LL_USART_ReceiveData8(USART_TypeDef *USARTx)
{
  return (uint8_t)(READ_REG(USARTx->DR) & 0xFFU);
}

__STATIC_INLINE uint32_t LL_USART_IsActiveFlag_TXE(USART_TypeDef *USARTx)
{
  return ((READ_BIT(USARTx->SR, USART_SR_TXE) == USART_SR_TXE) ? 1UL : 0UL);
}

__STATIC_INLINE uint32_t LL_USART_IsActiveFlag_RXNE(USART_TypeDef *USARTx)
{
  return ((READ_BIT(USARTx->SR, USART_SR_RXNE) == USART_SR_RXNE) ? 1UL : 0UL);
}

__STATIC_INLINE uint32_t LL_USART_IsActiveFlag_TC(USART_TypeDef *USARTx)
{
  return ((READ_BIT(USARTx->SR, USART_SR_TC) == USART_SR_TC) ? 1UL : 0UL);
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_USART_H */
