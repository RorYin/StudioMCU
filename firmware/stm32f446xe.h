/**
  ******************************************************************************
  * @file    stm32f446xe.h
  * @author  StudioMCU (teaching subset of ST CMSIS device headers)
  * @brief   CMSIS-style device header for STM32F446RE (NUCLEO-F446RE).
  *
  * Naming, peripheral structs, bit macros, and register helpers follow
  * STMicroelectronics CMSIS / HAL / LL conventions so lessons match vendor docs.
  ******************************************************************************
  */
#ifndef STM32F446XE_H
#define STM32F446XE_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>

/* -------------------------------------------------------------------------- */
/* CMSIS compiler helpers                                                     */
/* -------------------------------------------------------------------------- */
#define __I     volatile const
#define __O     volatile
#define __IO    volatile

#ifndef __ASM
#define __ASM   __asm
#endif

#ifndef __STATIC_INLINE
#define __STATIC_INLINE  static inline
#endif

#ifndef __NOP
#define __NOP()  __ASM volatile ("nop")
#endif

/* -------------------------------------------------------------------------- */
/* ST HAL/LL register access macros                                           */
/* -------------------------------------------------------------------------- */
#define SET_BIT(REG, BIT)     ((REG) |= (BIT))
#define CLEAR_BIT(REG, BIT)   ((REG) &= ~(BIT))
#define READ_BIT(REG, BIT)    ((REG) & (BIT))
#define CLEAR_REG(REG)        ((REG) = (0x0U))
#define WRITE_REG(REG, VAL)   ((REG) = (VAL))
#define READ_REG(REG)         ((REG))
#define MODIFY_REG(REG, CLEARMASK, SETMASK)  \
  WRITE_REG((REG), (((READ_REG(REG)) & (~(CLEARMASK))) | (SETMASK)))

/* Position of the lowest set bit (used by LL unitary functions). */
#define POSITION_VAL(VAL)  ((uint32_t)__builtin_ctz((VAL)))

/* -------------------------------------------------------------------------- */
/* Memory map                                                                 */
/* -------------------------------------------------------------------------- */
#define FLASH_BASE            0x08000000UL
#define SRAM_BASE             0x20000000UL
#define PERIPH_BASE           0x40000000UL
#define APB1PERIPH_BASE       PERIPH_BASE
#define APB2PERIPH_BASE       (PERIPH_BASE + 0x00010000UL)
#define AHB1PERIPH_BASE       (PERIPH_BASE + 0x00020000UL)
#define AHB2PERIPH_BASE       (PERIPH_BASE + 0x10000000UL)

#define TIM2_BASE             (APB1PERIPH_BASE + 0x0000UL)
#define TIM3_BASE             (APB1PERIPH_BASE + 0x0400UL)
#define USART2_BASE           (APB1PERIPH_BASE + 0x4400UL)
#define I2C1_BASE             (APB1PERIPH_BASE + 0x5400UL)

#define USART1_BASE           (APB2PERIPH_BASE + 0x1000UL)
#define ADC1_BASE             (APB2PERIPH_BASE + 0x2000UL)
#define SPI1_BASE             (APB2PERIPH_BASE + 0x3000UL)
#define SYSCFG_BASE           (APB2PERIPH_BASE + 0x3800UL)
#define EXTI_BASE             (APB2PERIPH_BASE + 0x3C00UL)

#define GPIOA_BASE            (AHB1PERIPH_BASE + 0x0000UL)
#define GPIOB_BASE            (AHB1PERIPH_BASE + 0x0400UL)
#define GPIOC_BASE            (AHB1PERIPH_BASE + 0x0800UL)
#define RCC_BASE              (AHB1PERIPH_BASE + 0x3800UL)

#define SCS_BASE              0xE000E000UL
#define SysTick_BASE          (SCS_BASE + 0x0010UL)
#define NVIC_BASE             (SCS_BASE + 0x0100UL)

/* -------------------------------------------------------------------------- */
/* Peripheral register structs (ST CMSIS layout)                              */
/* -------------------------------------------------------------------------- */
typedef struct {
  __IO uint32_t MODER;
  __IO uint32_t OTYPER;
  __IO uint32_t OSPEEDR;
  __IO uint32_t PUPDR;
  __I  uint32_t IDR;
  __IO uint32_t ODR;
  __IO uint32_t BSRR;
  __IO uint32_t LCKR;
  __IO uint32_t AFR[2];
} GPIO_TypeDef;

typedef struct {
  __IO uint32_t CR;
  __IO uint32_t PLLCFGR;
  __IO uint32_t CFGR;
  __IO uint32_t CIR;
  __IO uint32_t AHB1RSTR;
  __IO uint32_t AHB2RSTR;
  __IO uint32_t AHB3RSTR;
  uint32_t      RESERVED0;
  __IO uint32_t APB1RSTR;
  __IO uint32_t APB2RSTR;
  uint32_t      RESERVED1[2];
  __IO uint32_t AHB1ENR;
  __IO uint32_t AHB2ENR;
  __IO uint32_t AHB3ENR;
  uint32_t      RESERVED2;
  __IO uint32_t APB1ENR;
  __IO uint32_t APB2ENR;
  uint32_t      RESERVED3[2];
  __IO uint32_t AHB1LPENR;
  __IO uint32_t AHB2LPENR;
  __IO uint32_t AHB3LPENR;
  uint32_t      RESERVED4;
  __IO uint32_t APB1LPENR;
  __IO uint32_t APB2LPENR;
  uint32_t      RESERVED5[2];
  __IO uint32_t BDCR;
  __IO uint32_t CSR;
  uint32_t      RESERVED6[2];
  __IO uint32_t SSCGR;
  __IO uint32_t PLLI2SCFGR;
  __IO uint32_t PLLSAICFGR;
  __IO uint32_t DCKCFGR;
  __IO uint32_t CKGATENR;
  __IO uint32_t DCKCFGR2;
} RCC_TypeDef;

typedef struct {
  __IO uint32_t SR;
  __IO uint32_t DR;
  __IO uint32_t BRR;
  __IO uint32_t CR1;
  __IO uint32_t CR2;
  __IO uint32_t CR3;
  __IO uint32_t GTPR;
} USART_TypeDef;

typedef struct {
  __IO uint32_t CR1;
  __IO uint32_t CR2;
  __IO uint32_t SR;
  __IO uint32_t DR;
  __IO uint32_t CRCPR;
  __IO uint32_t RXCRCR;
  __IO uint32_t TXCRCR;
  __IO uint32_t I2SCFGR;
  __IO uint32_t I2SPR;
} SPI_TypeDef;

typedef struct {
  __IO uint32_t CR1;
  __IO uint32_t CR2;
  __IO uint32_t OAR1;
  __IO uint32_t OAR2;
  __IO uint32_t DR;
  __IO uint32_t SR1;
  __IO uint32_t SR2;
  __IO uint32_t CCR;
  __IO uint32_t TRISE;
  __IO uint32_t FLTR;
} I2C_TypeDef;

typedef struct {
  __IO uint32_t CR1;
  __IO uint32_t CR2;
  __IO uint32_t SMCR;
  __IO uint32_t DIER;
  __IO uint32_t SR;
  __IO uint32_t EGR;
  __IO uint32_t CCMR1;
  __IO uint32_t CCMR2;
  __IO uint32_t CCER;
  __IO uint32_t CNT;
  __IO uint32_t PSC;
  __IO uint32_t ARR;
  __IO uint32_t RCR;
  __IO uint32_t CCR1;
  __IO uint32_t CCR2;
  __IO uint32_t CCR3;
  __IO uint32_t CCR4;
  __IO uint32_t BDTR;
  __IO uint32_t DCR;
  __IO uint32_t DMAR;
} TIM_TypeDef;

typedef struct {
  __IO uint32_t SR;
  __IO uint32_t CR1;
  __IO uint32_t CR2;
  __IO uint32_t SMPR1;
  __IO uint32_t SMPR2;
  __IO uint32_t JOFR1;
  __IO uint32_t JOFR2;
  __IO uint32_t JOFR3;
  __IO uint32_t JOFR4;
  __IO uint32_t HTR;
  __IO uint32_t LTR;
  __IO uint32_t SQR1;
  __IO uint32_t SQR2;
  __IO uint32_t SQR3;
  __IO uint32_t JSQR;
  __IO uint32_t JDR1;
  __IO uint32_t JDR2;
  __IO uint32_t JDR3;
  __IO uint32_t JDR4;
  __IO uint32_t DR;
} ADC_TypeDef;

typedef struct {
  __IO uint32_t IMR;
  __IO uint32_t EMR;
  __IO uint32_t RTSR;
  __IO uint32_t FTSR;
  __IO uint32_t SWIER;
  __IO uint32_t PR;
} EXTI_TypeDef;

typedef struct {
  __IO uint32_t MEMRMP;
  __IO uint32_t PMC;
  __IO uint32_t EXTICR[4];
  uint32_t      RESERVED[2];
  __IO uint32_t CMPCR;
  uint32_t      RESERVED1[2];
  __IO uint32_t CFGR;
} SYSCFG_TypeDef;

typedef struct {
  __IO uint32_t CTRL;
  __IO uint32_t LOAD;
  __IO uint32_t VAL;
  __I  uint32_t CALIB;
} SysTick_Type;

typedef struct {
  __IO uint32_t ISER[8];
  uint32_t      RESERVED0[24];
  __IO uint32_t ICER[8];
  uint32_t      RESERVED1[24];
  __IO uint32_t ISPR[8];
  uint32_t      RESERVED2[24];
  __IO uint32_t ICPR[8];
  uint32_t      RESERVED3[24];
  __IO uint32_t IABR[8];
  uint32_t      RESERVED4[56];
  __IO uint8_t  IP[240];
  uint32_t      RESERVED5[644];
  __O  uint32_t STIR;
} NVIC_Type;

/* -------------------------------------------------------------------------- */
/* Peripheral instances                                                       */
/* -------------------------------------------------------------------------- */
#define GPIOA               ((GPIO_TypeDef *) GPIOA_BASE)
#define GPIOB               ((GPIO_TypeDef *) GPIOB_BASE)
#define GPIOC               ((GPIO_TypeDef *) GPIOC_BASE)
#define RCC                 ((RCC_TypeDef *) RCC_BASE)
#define USART1              ((USART_TypeDef *) USART1_BASE)
#define USART2              ((USART_TypeDef *) USART2_BASE)
#define SPI1                ((SPI_TypeDef *) SPI1_BASE)
#define I2C1                ((I2C_TypeDef *) I2C1_BASE)
#define TIM2                ((TIM_TypeDef *) TIM2_BASE)
#define TIM3                ((TIM_TypeDef *) TIM3_BASE)
#define ADC1                ((ADC_TypeDef *) ADC1_BASE)
#define EXTI                ((EXTI_TypeDef *) EXTI_BASE)
#define SYSCFG              ((SYSCFG_TypeDef *) SYSCFG_BASE)
#define SysTick             ((SysTick_Type *) SysTick_BASE)
#define NVIC                ((NVIC_Type *) NVIC_BASE)

/* -------------------------------------------------------------------------- */
/* IRQn values used by simple lessons                                         */
/* -------------------------------------------------------------------------- */
typedef enum {
  NonMaskableInt_IRQn   = -14,
  HardFault_IRQn        = -13,
  SVCall_IRQn           = -5,
  PendSV_IRQn           = -2,
  SysTick_IRQn          = -1,
  USART2_IRQn           = 38,
  EXTI15_10_IRQn        = 40,
} IRQn_Type;

/* -------------------------------------------------------------------------- */
/* RCC bit definitions                                                        */
/* -------------------------------------------------------------------------- */
#define RCC_AHB1ENR_GPIOAEN                 (1U << 0)
#define RCC_AHB1ENR_GPIOBEN                 (1U << 1)
#define RCC_AHB1ENR_GPIOCEN                 (1U << 2)
#define RCC_APB1ENR_TIM2EN                  (1U << 0)
#define RCC_APB1ENR_TIM3EN                  (1U << 1)
#define RCC_APB1ENR_USART2EN                (1U << 17)
#define RCC_APB1ENR_I2C1EN                  (1U << 21)
#define RCC_APB2ENR_USART1EN                (1U << 4)
#define RCC_APB2ENR_ADC1EN                  (1U << 8)
#define RCC_APB2ENR_SPI1EN                  (1U << 12)
#define RCC_APB2ENR_SYSCFGEN                (1U << 14)

/* -------------------------------------------------------------------------- */
/* GPIO helpers                                                               */
/* -------------------------------------------------------------------------- */
#define GPIO_MODER_MODE0_Pos                (0U)
#define GPIO_MODER_MODEy_Pos(y)             ((uint32_t)(y) * 2U)
#define GPIO_MODER_MODEy_Msk(y)             (3U << GPIO_MODER_MODEy_Pos(y))
#define GPIO_MODER_MODEy_INPUT(y)           (0U << GPIO_MODER_MODEy_Pos(y))
#define GPIO_MODER_MODEy_OUTPUT(y)          (1U << GPIO_MODER_MODEy_Pos(y))
#define GPIO_MODER_MODEy_ALTERNATE(y)       (2U << GPIO_MODER_MODEy_Pos(y))
#define GPIO_MODER_MODEy_ANALOG(y)          (3U << GPIO_MODER_MODEy_Pos(y))

#define GPIO_MODER_MODE0_Msk                GPIO_MODER_MODEy_Msk(0)
#define GPIO_MODER_MODE2_Msk                GPIO_MODER_MODEy_Msk(2)
#define GPIO_MODER_MODE3_Msk                GPIO_MODER_MODEy_Msk(3)
#define GPIO_MODER_MODE5_Msk                GPIO_MODER_MODEy_Msk(5)
#define GPIO_MODER_MODE6_Msk                GPIO_MODER_MODEy_Msk(6)
#define GPIO_MODER_MODE7_Msk                GPIO_MODER_MODEy_Msk(7)
#define GPIO_MODER_MODE8_Msk                GPIO_MODER_MODEy_Msk(8)
#define GPIO_MODER_MODE9_Msk                GPIO_MODER_MODEy_Msk(9)
#define GPIO_MODER_MODE10_Msk               GPIO_MODER_MODEy_Msk(10)
#define GPIO_MODER_MODE13_Msk               GPIO_MODER_MODEy_Msk(13)

#define GPIO_MODER_MODE0_ANALOG             GPIO_MODER_MODEy_ANALOG(0)
#define GPIO_MODER_MODE2_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(2)
#define GPIO_MODER_MODE3_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(3)
#define GPIO_MODER_MODE5_OUTPUT             GPIO_MODER_MODEy_OUTPUT(5)
#define GPIO_MODER_MODE5_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(5)
#define GPIO_MODER_MODE6_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(6)
#define GPIO_MODER_MODE7_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(7)
#define GPIO_MODER_MODE8_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(8)
#define GPIO_MODER_MODE9_ALTERNATE          GPIO_MODER_MODEy_ALTERNATE(9)
#define GPIO_MODER_MODE10_ALTERNATE         GPIO_MODER_MODEy_ALTERNATE(10)
#define GPIO_MODER_MODE13_INPUT             GPIO_MODER_MODEy_INPUT(13)

/* Official F4 CMSIS aliases (MODER / AFRL naming). */
#define GPIO_MODER_MODER0                   GPIO_MODER_MODE0_Msk
#define GPIO_MODER_MODER5                   GPIO_MODER_MODE5_Msk
#define GPIO_MODER_MODER13                  GPIO_MODER_MODE13_Msk

#define GPIO_AFR_AFSEL0_Pos                 (0U)
#define GPIO_AFR_AFSEL2_Pos                 (8U)
#define GPIO_AFR_AFSEL3_Pos                 (12U)
#define GPIO_AFR_AFSEL5_Pos                 (20U)
#define GPIO_AFR_AFSEL6_Pos                 (24U)
#define GPIO_AFR_AFSEL7_Pos                 (28U)
#define GPIO_AFR_AFSEL8_Pos                 (0U)
#define GPIO_AFR_AFSEL9_Pos                 (4U)
#define GPIO_AFR_AFSEL10_Pos                (8U)

#define GPIO_AFR_AFSEL2_Msk                 (0xFU << GPIO_AFR_AFSEL2_Pos)
#define GPIO_AFR_AFSEL3_Msk                 (0xFU << GPIO_AFR_AFSEL3_Pos)
#define GPIO_AFR_AFSEL5_Msk                 (0xFU << GPIO_AFR_AFSEL5_Pos)
#define GPIO_AFR_AFSEL6_Msk                 (0xFU << GPIO_AFR_AFSEL6_Pos)
#define GPIO_AFR_AFSEL7_Msk                 (0xFU << GPIO_AFR_AFSEL7_Pos)
#define GPIO_AFR_AFSEL8_Msk                 (0xFU << GPIO_AFR_AFSEL8_Pos)
#define GPIO_AFR_AFSEL9_Msk                 (0xFU << GPIO_AFR_AFSEL9_Pos)
#define GPIO_AFR_AFSEL10_Msk                (0xFU << GPIO_AFR_AFSEL10_Pos)

#define GPIO_AFR_AFSEL2_AF7                 (7U << GPIO_AFR_AFSEL2_Pos)
#define GPIO_AFR_AFSEL3_AF7                 (7U << GPIO_AFR_AFSEL3_Pos)
#define GPIO_AFR_AFSEL5_AF1                 (1U << GPIO_AFR_AFSEL5_Pos)
#define GPIO_AFR_AFSEL5_AF5                 (5U << GPIO_AFR_AFSEL5_Pos)
#define GPIO_AFR_AFSEL6_AF5                 (5U << GPIO_AFR_AFSEL6_Pos)
#define GPIO_AFR_AFSEL7_AF5                 (5U << GPIO_AFR_AFSEL7_Pos)
#define GPIO_AFR_AFSEL8_AF4                 (4U << GPIO_AFR_AFSEL8_Pos)
#define GPIO_AFR_AFSEL9_AF4                 (4U << GPIO_AFR_AFSEL9_Pos)
#define GPIO_AFR_AFSEL9_AF7                 (7U << GPIO_AFR_AFSEL9_Pos)
#define GPIO_AFR_AFSEL10_AF7                (7U << GPIO_AFR_AFSEL10_Pos)

#define GPIO_ODR_OD5                        (1U << 5)
#define GPIO_IDR_ID13                       (1U << 13)
#define GPIO_BSRR_BS5                       (1U << 5)
#define GPIO_BSRR_BR5                       (1U << (5U + 16U))
#define GPIO_BSRR_BS_0                      (0x00000001U)
#define GPIO_BSRR_BR_0                      (0x00010000U)

#define GPIO_AFRL_AFSEL2_Msk                GPIO_AFR_AFSEL2_Msk
#define GPIO_AFRL_AFSEL3_Msk                GPIO_AFR_AFSEL3_Msk
#define GPIO_AFRL_AFSEL5_Msk                GPIO_AFR_AFSEL5_Msk
#define GPIO_AFRL_AFSEL6_Msk                GPIO_AFR_AFSEL6_Msk
#define GPIO_AFRL_AFSEL7_Msk                GPIO_AFR_AFSEL7_Msk
#define GPIO_AFRL_AFSEL2_AF7                GPIO_AFR_AFSEL2_AF7
#define GPIO_AFRL_AFSEL3_AF7                GPIO_AFR_AFSEL3_AF7
#define GPIO_AFRL_AFSEL5_AF5                GPIO_AFR_AFSEL5_AF5
#define GPIO_AFRL_AFSEL6_AF5                GPIO_AFR_AFSEL6_AF5
#define GPIO_AFRL_AFSEL7_AF5                GPIO_AFR_AFSEL7_AF5

/* -------------------------------------------------------------------------- */
/* USART                                                                      */
/* -------------------------------------------------------------------------- */
#define USART_SR_RXNE                       (1U << 5)
#define USART_SR_TC                         (1U << 6)
#define USART_SR_TXE                        (1U << 7)
#define USART_CR1_RE                        (1U << 2)
#define USART_CR1_TE                        (1U << 3)
#define USART_CR1_UE                        (1U << 13)

/* -------------------------------------------------------------------------- */
/* SPI                                                                        */
/* -------------------------------------------------------------------------- */
#define SPI_CR1_CPHA                        (1U << 0)
#define SPI_CR1_CPOL                        (1U << 1)
#define SPI_CR1_MSTR                        (1U << 2)
#define SPI_CR1_BR_Pos                      (3U)
#define SPI_CR1_SPE                         (1U << 6)
#define SPI_CR1_SSI                         (1U << 8)
#define SPI_CR1_SSM                         (1U << 9)
#define SPI_SR_RXNE                         (1U << 0)
#define SPI_SR_TXE                          (1U << 1)
#define SPI_SR_BSY                          (1U << 7)

/* -------------------------------------------------------------------------- */
/* I2C                                                                        */
/* -------------------------------------------------------------------------- */
#define I2C_CR1_PE                          (1U << 0)
#define I2C_CR1_START                       (1U << 8)
#define I2C_CR1_STOP                        (1U << 9)
#define I2C_CR1_ACK                         (1U << 10)
#define I2C_SR1_SB                          (1U << 0)
#define I2C_SR1_ADDR                        (1U << 1)
#define I2C_SR1_TXE                         (1U << 7)
#define I2C_SR1_RXNE                        (1U << 6)
#define I2C_SR2_BUSY                        (1U << 1)

/* -------------------------------------------------------------------------- */
/* TIM                                                                        */
/* -------------------------------------------------------------------------- */
#define TIM_CR1_CEN                         (1U << 0)
#define TIM_CR1_ARPE                        (1U << 7)
#define TIM_CCMR1_OC1M_Pos                  (4U)
#define TIM_CCMR1_OC1M_PWM1                 (6U << 4)
#define TIM_CCMR1_OC1PE                     (1U << 3)
#define TIM_CCER_CC1E                       (1U << 0)
#define TIM_EGR_UG                          (1U << 0)

/* -------------------------------------------------------------------------- */
/* ADC                                                                        */
/* -------------------------------------------------------------------------- */
#define ADC_SR_EOC                          (1U << 1)
#define ADC_CR2_ADON                        (1U << 0)
#define ADC_CR2_SWSTART                     (1U << 30)
#define ADC_SQR3_SQ1_Pos                    (0U)

/* -------------------------------------------------------------------------- */
/* SysTick                                                                    */
/* -------------------------------------------------------------------------- */
#define SysTick_CTRL_ENABLE_Msk             (1U << 0)
#define SysTick_CTRL_TICKINT_Msk            (1U << 1)
#define SysTick_CTRL_CLKSOURCE_Msk          (1U << 2)
#define SysTick_CTRL_COUNTFLAG_Msk          (1U << 16)

/* -------------------------------------------------------------------------- */
/* EXTI / SYSCFG helpers for PC13 button                                      */
/* -------------------------------------------------------------------------- */
#define EXTI_IMR_MR13                       (1U << 13)
#define EXTI_FTSR_TR13                      (1U << 13)
#define EXTI_PR_PR13                        (1U << 13)
#define SYSCFG_EXTICR4_EXTI13_PC            (2U << 4)

#ifdef __cplusplus
}
#endif

#endif /* STM32F446XE_H */
