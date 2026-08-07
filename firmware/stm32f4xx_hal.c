/**
  ******************************************************************************
  * @file    stm32f4xx_hal.c
  * @brief   Teaching subset of ST HAL core + GPIO implementation.
  ******************************************************************************
  */
#include "stm32f4xx_hal.h"

static volatile uint32_t uwTick = 0U;
static uint32_t uwTickFreq = 1U; /* 1 ms */

HAL_StatusTypeDef HAL_Init(void)
{
  /* Configure SysTick for 1 ms interrupts @ 16 MHz HSI (NUCLEO default). */
  SysTick->LOAD = 16000U - 1U;
  SysTick->VAL = 0U;
  SysTick->CTRL = SysTick_CTRL_CLKSOURCE_Msk |
                  SysTick_CTRL_TICKINT_Msk |
                  SysTick_CTRL_ENABLE_Msk;
  return HAL_OK;
}

void HAL_IncTick(void)
{
  uwTick += uwTickFreq;
}

uint32_t HAL_GetTick(void)
{
  return uwTick;
}

void HAL_Delay(uint32_t Delay)
{
  uint32_t tickstart = HAL_GetTick();
  uint32_t wait = Delay;

  if (wait < HAL_MAX_DELAY)
  {
    wait += (uint32_t)uwTickFreq;
  }

  while ((HAL_GetTick() - tickstart) < wait)
  {
  }
}

void SysTick_Handler(void)
{
  HAL_IncTick();
}

void HAL_GPIO_Init(GPIO_TypeDef *GPIOx, GPIO_InitTypeDef *GPIO_Init)
{
  uint32_t position;
  uint32_t ioposition;
  uint32_t iocurrent;
  uint32_t temp;

  for (position = 0U; position < 16U; position++)
  {
    ioposition = (1UL << position);
    iocurrent = (uint32_t)(GPIO_Init->Pin) & ioposition;

    if (iocurrent == ioposition)
    {
      /* Mode */
      temp = GPIOx->MODER;
      temp &= ~(3U << (position * 2U));
      temp |= (((GPIO_Init->Mode) & 0x03U) << (position * 2U));
      GPIOx->MODER = temp;

      if ((GPIO_Init->Mode == GPIO_MODE_OUTPUT_PP) ||
          (GPIO_Init->Mode == GPIO_MODE_OUTPUT_OD) ||
          (GPIO_Init->Mode == GPIO_MODE_AF_PP) ||
          (GPIO_Init->Mode == GPIO_MODE_AF_OD))
      {
        temp = GPIOx->OSPEEDR;
        temp &= ~(3U << (position * 2U));
        temp |= ((GPIO_Init->Speed) << (position * 2U));
        GPIOx->OSPEEDR = temp;

        temp = GPIOx->OTYPER;
        temp &= ~(1U << position);
        temp |= ((((GPIO_Init->Mode) & 0x10U) >> 4U) << position);
        GPIOx->OTYPER = temp;
      }

      temp = GPIOx->PUPDR;
      temp &= ~(3U << (position * 2U));
      temp |= ((GPIO_Init->Pull) << (position * 2U));
      GPIOx->PUPDR = temp;

      if ((GPIO_Init->Mode == GPIO_MODE_AF_PP) ||
          (GPIO_Init->Mode == GPIO_MODE_AF_OD))
      {
        temp = GPIOx->AFR[position >> 3U];
        temp &= ~(0xFU << ((position & 7U) * 4U));
        temp |= (((uint32_t)(GPIO_Init->Alternate) & 0xFU) << ((position & 7U) * 4U));
        GPIOx->AFR[position >> 3U] = temp;
      }
    }
  }
}

void HAL_GPIO_WritePin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState)
{
  if (PinState != GPIO_PIN_RESET)
  {
    GPIOx->BSRR = GPIO_Pin;
  }
  else
  {
    GPIOx->BSRR = ((uint32_t)GPIO_Pin << 16U);
  }
}

void HAL_GPIO_TogglePin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin)
{
  uint32_t odr = GPIOx->ODR;
  GPIOx->BSRR = ((odr & GPIO_Pin) << 16U) | (~odr & GPIO_Pin);
}

GPIO_PinState HAL_GPIO_ReadPin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin)
{
  GPIO_PinState bitstatus;

  if ((GPIOx->IDR & GPIO_Pin) != 0U)
  {
    bitstatus = GPIO_PIN_SET;
  }
  else
  {
    bitstatus = GPIO_PIN_RESET;
  }
  return bitstatus;
}
