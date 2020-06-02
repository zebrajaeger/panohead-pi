#pragma once

#include <Arduino.h>
#include "types.h"

class Joystick
{
public:
    class Axis
    {
    public:
        u16_t raw;
        u16_t center;
        u16_t backlash;
        u16_t pos;
    };

    Joystick() {}

    // -----------------------------------------------------------------------------
    bool setup(uint8_t pinX, uint8_t pinY)
    // -----------------------------------------------------------------------------
    {
        pinX_ = pinX;
        pinY_ = pinY;
        analogReference(DEFAULT);
        x_.pos.uint16 = 0;
        y_.pos.uint16 = 0;
        x_.backlash.uint16 = 1;
        y_.backlash.uint16 = 1;
        x_.center.uint16 = 512;
        y_.center.uint16 = 512;

        return true;
    }

    // -----------------------------------------------------------------------------
    void calibrate()
    // -----------------------------------------------------------------------------
    {
        x_.center.uint16 = analogRead(pinX_);
        y_.center.uint16 = analogRead(pinY_);
    }

    // -----------------------------------------------------------------------------
    void loop()
    // -----------------------------------------------------------------------------
    {
        isJogging_ = false;
        isJogging_ |= calcJoystickValue(x_, analogRead(JOYSTICK_X_PIN));
        isJogging_ |= calcJoystickValue(y_, analogRead(JOYSTICK_Y_PIN));
    }

    // -----------------------------------------------------------------------------
    bool getIsJogging()
    // -----------------------------------------------------------------------------
    {
        return isJogging_;
    }

    // -----------------------------------------------------------------------------
    const Axis &getX()
    // -----------------------------------------------------------------------------
    {
        return x_;
    }

    // -----------------------------------------------------------------------------
    const Axis &getY()
    // -----------------------------------------------------------------------------
    {
        return y_;
    }

private:
    // -----------------------------------------------------------------------------
    bool calcJoystickValue(Axis &axis, uint16_t newValue)
    // -----------------------------------------------------------------------------
    {
        axis.raw.uint16 = newValue;
        int16_t delta = newValue - axis.center.uint16;
        if (delta > 0 && delta > axis.backlash.int16)
        {
            axis.pos.int16 = map(newValue, axis.center.uint16, 1023, 0, 1000);
            return true;
        }

        if (delta < 0 && delta < -axis.backlash.int16)
        {
            axis.pos.int16 = map(newValue, 0, axis.center.uint16, -1000, 0);
            return true;
        }

        axis.pos.uint16 = 0;
        return false;
    }

    uint8_t pinX_;
    uint8_t pinY_;
    Axis x_;
    Axis y_;
    bool isJogging_;
};