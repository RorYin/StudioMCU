/**
  ******************************************************************************
  * @file    stm32f4xx_ll_spi.h
  * @brief   Teaching subset of ST LL SPI APIs (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_SPI_H
#define STM32F4XX_LL_SPI_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

#define LL_SPI_MODE_SLAVE                  0x00000000U
#define LL_SPI_MODE_MASTER                 (SPI_CR1_MSTR | SPI_CR1_SSI)

#define LL_SPI_BAUDRATEPRESCALER_DIV2      0x00000000U
#define LL_SPI_BAUDRATEPRESCALER_DIV4      (0x1U << SPI_CR1_BR_Pos)
#define LL_SPI_BAUDRATEPRESCALER_DIV8      (0x2U << SPI_CR1_BR_Pos)
#define LL_SPI_BAUDRATEPRESCALER_DIV16     (0x3U << SPI_CR1_BR_Pos)
#define LL_SPI_BAUDRATEPRESCALER_DIV32     (0x4U << SPI_CR1_BR_Pos)
#define LL_SPI_BAUDRATEPRESCALER_DIV64     (0x5U << SPI_CR1_BR_Pos)
#define LL_SPI_BAUDRATEPRESCALER_DIV128    (0x6U << SPI_CR1_BR_Pos)
#define LL_SPI_BAUDRATEPRESCALER_DIV256    (0x7U << SPI_CR1_BR_Pos)

__STATIC_INLINE void LL_SPI_Enable(SPI_TypeDef *SPIx)
{
  SET_BIT(SPIx->CR1, SPI_CR1_SPE);
}

__STATIC_INLINE void LL_SPI_Disable(SPI_TypeDef *SPIx)
{
  CLEAR_BIT(SPIx->CR1, SPI_CR1_SPE);
}

__STATIC_INLINE void LL_SPI_SetMode(SPI_TypeDef *SPIx, uint32_t Mode)
{
  MODIFY_REG(SPIx->CR1, SPI_CR1_MSTR | SPI_CR1_SSI, Mode);
}

__STATIC_INLINE void LL_SPI_SetBaudRatePrescaler(SPI_TypeDef *SPIx, uint32_t BaudRate)
{
  MODIFY_REG(SPIx->CR1, (0x7U << SPI_CR1_BR_Pos), BaudRate);
}

__STATIC_INLINE void LL_SPI_EnableNSSPulseMgt(SPI_TypeDef *SPIx)
{
  (void)SPIx;
}

__STATIC_INLINE void LL_SPI_SetNSSModeSoft(SPI_TypeDef *SPIx)
{
  SET_BIT(SPIx->CR1, SPI_CR1_SSM | SPI_CR1_SSI);
}

__STATIC_INLINE void LL_SPI_TransmitData8(SPI_TypeDef *SPIx, uint8_t TxData)
{
  *((__IO uint8_t *)&SPIx->DR) = TxData;
}

__STATIC_INLINE uint8_t LL_SPI_ReceiveData8(SPI_TypeDef *SPIx)
{
  return (uint8_t)(READ_REG(SPIx->DR));
}

__STATIC_INLINE uint32_t LL_SPI_IsActiveFlag_TXE(SPI_TypeDef *SPIx)
{
  return ((READ_BIT(SPIx->SR, SPI_SR_TXE) == SPI_SR_TXE) ? 1UL : 0UL);
}

__STATIC_INLINE uint32_t LL_SPI_IsActiveFlag_RXNE(SPI_TypeDef *SPIx)
{
  return ((READ_BIT(SPIx->SR, SPI_SR_RXNE) == SPI_SR_RXNE) ? 1UL : 0UL);
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_SPI_H */
