/**
  ******************************************************************************
  * @file    stm32f4xx_hal_def.h
  * @brief   Teaching subset of ST HAL common definitions.
  ******************************************************************************
  */
#ifndef STM32F4XX_HAL_DEF_H
#define STM32F4XX_HAL_DEF_H

#include "stm32f4xx.h"

typedef enum {
  HAL_OK       = 0x00U,
  HAL_ERROR    = 0x01U,
  HAL_BUSY     = 0x02U,
  HAL_TIMEOUT  = 0x03U
} HAL_StatusTypeDef;

typedef enum {
  HAL_UNLOCKED = 0x00U,
  HAL_LOCKED   = 0x01U
} HAL_LockTypeDef;

#ifndef UNUSED
#define UNUSED(X)  ((void)(X))
#endif

#define HAL_MAX_DELAY  0xFFFFFFFFU

#endif /* STM32F4XX_HAL_DEF_H */
