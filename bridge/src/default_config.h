#pragma once

#if __has_include("config.h")
#include "config.h"
#endif

// Steppers
#ifndef CS_PIN
#define CS_PIN 10
#endif

#ifndef TMC_CLOCK_MHZ
#define TMC_CLOCK_MHZ 16
#endif

#ifndef I2C_ADDRESS
#define I2C_ADDRESS 0x45
#endif

#ifndef LED_MOVE_PIN_1
#define LED_MOVE_PIN_1 3
#endif

#ifndef LED_MOVE_PIN_2
#define LED_MOVE_PIN_2 4
#endif

// Joystick
#ifndef JOYSTICK_X_PIN
#define JOYSTICK_X_PIN A0
#endif

#ifndef JOYSTICK_Y_PIN
#define JOYSTICK_Y_PIN A1
#endif

#ifndef LED_JOYSTICK_PIN
#define LED_JOYSTICK_PIN 5
#endif

// Camera
#ifndef CAMERA_FOCUS_PIN
#define CAMERA_FOCUS_PIN 6
#endif

#ifndef CAMERA_TRIGGER_PIN
#define CAMERA_TRIGGER_PIN 7
#endif

