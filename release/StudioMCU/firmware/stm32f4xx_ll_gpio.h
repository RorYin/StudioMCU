/**
  ******************************************************************************
  * @file    stm32f4xx_ll_gpio.h
  * @brief   Teaching subset of ST LL GPIO APIs (F4 naming).
  ******************************************************************************
  */
#ifndef STM32F4XX_LL_GPIO_H
#define STM32F4XX_LL_GPIO_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32f4xx.h"

#define LL_GPIO_PIN_0                  GPIO_BSRR_BS_0
#define LL_GPIO_PIN_1                  (GPIO_BSRR_BS_0 << 1)
#define LL_GPIO_PIN_2                  (GPIO_BSRR_BS_0 << 2)
#define LL_GPIO_PIN_3                  (GPIO_BSRR_BS_0 << 3)
#define LL_GPIO_PIN_4                  (GPIO_BSRR_BS_0 << 4)
#define LL_GPIO_PIN_5                  (GPIO_BSRR_BS_0 << 5)
#define LL_GPIO_PIN_6                  (GPIO_BSRR_BS_0 << 6)
#define LL_GPIO_PIN_7                  (GPIO_BSRR_BS_0 << 7)
#define LL_GPIO_PIN_8                  (GPIO_BSRR_BS_0 << 8)
#define LL_GPIO_PIN_9                  (GPIO_BSRR_BS_0 << 9)
#define LL_GPIO_PIN_10                 (GPIO_BSRR_BS_0 << 10)
#define LL_GPIO_PIN_11                 (GPIO_BSRR_BS_0 << 11)
#define LL_GPIO_PIN_12                 (GPIO_BSRR_BS_0 << 12)
#define LL_GPIO_PIN_13                 (GPIO_BSRR_BS_0 << 13)
#define LL_GPIO_PIN_14                 (GPIO_BSRR_BS_0 << 14)
#define LL_GPIO_PIN_15                 (GPIO_BSRR_BS_0 << 15)
#define LL_GPIO_PIN_ALL                0x0000FFFFU

#define LL_GPIO_MODE_INPUT             (0x00000000U)
#define LL_GPIO_MODE_OUTPUT            (0x00000001U)
#define LL_GPIO_MODE_ALTERNATE         (0x00000002U)
#define LL_GPIO_MODE_ANALOG            (0x00000003U)

#define LL_GPIO_OUTPUT_PUSHPULL        (0x00000000U)
#define LL_GPIO_OUTPUT_OPENDRAIN       (0x00000001U)

#define LL_GPIO_PULL_NO                (0x00000000U)
#define LL_GPIO_PULL_UP                (0x00000001U)
#define LL_GPIO_PULL_DOWN              (0x00000002U)

#define LL_GPIO_SPEED_FREQ_LOW         (0x00000000U)
#define LL_GPIO_SPEED_FREQ_MEDIUM      (0x00000001U)
#define LL_GPIO_SPEED_FREQ_HIGH        (0x00000002U)
#define LL_GPIO_SPEED_FREQ_VERY_HIGH   (0x00000003U)

#define LL_GPIO_AF_0                   (0x00000000U)
#define LL_GPIO_AF_1                   (0x00000001U)
#define LL_GPIO_AF_4                   (0x00000004U)
#define LL_GPIO_AF_5                   (0x00000005U)
#define LL_GPIO_AF_7                   (0x00000007U)

__STATIC_INLINE void LL_GPIO_SetPinMode(GPIO_TypeDef *GPIOx, uint32_t Pin, uint32_t Mode)
{
  MODIFY_REG(GPIOx->MODER,
             (3U << (POSITION_VAL(Pin) * 2U)),
             (Mode << (POSITION_VAL(Pin) * 2U)));
}

__STATIC_INLINE void LL_GPIO_SetPinOutputType(GPIO_TypeDef *GPIOx, uint32_t PinMask, uint32_t OutputType)
{
  MODIFY_REG(GPIOx->OTYPER, PinMask, (PinMask * OutputType));
}

__STATIC_INLINE void LL_GPIO_SetPinPull(GPIO_TypeDef *GPIOx, uint32_t Pin, uint32_t Pull)
{
  MODIFY_REG(GPIOx->PUPDR,
             (3U << (POSITION_VAL(Pin) * 2U)),
             (Pull << (POSITION_VAL(Pin) * 2U)));
}

__STATIC_INLINE void LL_GPIO_SetPinSpeed(GPIO_TypeDef *GPIOx, uint32_t Pin, uint32_t Speed)
{
  MODIFY_REG(GPIOx->OSPEEDR,
             (3U << (POSITION_VAL(Pin) * 2U)),
             (Speed << (POSITION_VAL(Pin) * 2U)));
}

__STATIC_INLINE void LL_GPIO_SetAFPin_0_7(GPIO_TypeDef *GPIOx, uint32_t Pin, uint32_t Alternate)
{
  MODIFY_REG(GPIOx->AFR[0],
             (0xFU << (POSITION_VAL(Pin) * 4U)),
             (Alternate << (POSITION_VAL(Pin) * 4U)));
}

__STATIC_INLINE void LL_GPIO_SetAFPin_8_15(GPIO_TypeDef *GPIOx, uint32_t Pin, uint32_t Alternate)
{
  MODIFY_REG(GPIOx->AFR[1],
             (0xFU << (POSITION_VAL(Pin >> 8U) * 4U)),
             (Alternate << (POSITION_VAL(Pin >> 8U) * 4U)));
}

__STATIC_INLINE void LL_GPIO_SetOutputPin(GPIO_TypeDef *GPIOx, uint32_t PinMask)
{
  WRITE_REG(GPIOx->BSRR, PinMask);
}

__STATIC_INLINE void LL_GPIO_ResetOutputPin(GPIO_TypeDef *GPIOx, uint32_t PinMask)
{
  WRITE_REG(GPIOx->BSRR, (PinMask << 16U));
}

__STATIC_INLINE void LL_GPIO_TogglePin(GPIO_TypeDef *GPIOx, uint32_t PinMask)
{
  uint32_t odr = READ_REG(GPIOx->ODR);
  WRITE_REG(GPIOx->BSRR, ((odr & PinMask) << 16U) | (~odr & PinMask));
}

__STATIC_INLINE uint32_t LL_GPIO_IsInputPinSet(GPIO_TypeDef *GPIOx, uint32_t PinMask)
{
  return ((READ_BIT(GPIOx->IDR, PinMask) == PinMask) ? 1UL : 0UL);
}

#ifdef __cplusplus
}
#endif

#endif /* STM32F4XX_LL_GPIO_H */
