#pragma once

#include <Arduino.h>
#include "types.h"

class Joystick
{
public:
    struct Calibration
    {

        u16_t min;
        u16_t center;
        u16_t max;
    };

    struct Axis
    {
        Calibration calibration;
        u16_t raw;
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
        x_.backlash.uint16 = 2;
        y_.backlash.uint16 = 2;

        return true;
    }

    // -----------------------------------------------------------------------------
    void loop()
    // -----------------------------------------------------------------------------
    {
        isJogging_ = false;
        isJogging_ |= calcJoystickValue(x_, analogRead(JOYSTICK_X_PIN));
        isJogging_ |= calcJoystickValue(y_, analogRead(JOYSTICK_Y_PIN));
        /*
        Serial.println("----");
        Serial.println(x_.calibration.min.uint16);
        Serial.println(x_.calibration.center.uint16);
        Serial.println(x_.calibration.max.uint16);
        */
    }

    // -----------------------------------------------------------------------------
    bool getIsJogging() const
    // -----------------------------------------------------------------------------
    {
        return isJogging_;
    }

    // -----------------------------------------------------------------------------
    const Axis &getX() const
    // -----------------------------------------------------------------------------
    {
        return x_;
    }
    // -----------------------------------------------------------------------------
    Calibration &getXCalibration()
    // -----------------------------------------------------------------------------
    {
        return x_.calibration;
    }

    // -----------------------------------------------------------------------------
    const Axis &getY() const
    // -----------------------------------------------------------------------------
    {
        return y_;
    }
    // -----------------------------------------------------------------------------
    Calibration &getYCalibration()
    // -----------------------------------------------------------------------------
    {
        return y_.calibration;
    }

private:
    // -----------------------------------------------------------------------------
    bool calcJoystickValue(Axis &axis, uint16_t newValue)
    // -----------------------------------------------------------------------------
    {
        axis.raw.uint16 = newValue;
        int16_t delta = newValue - axis.calibration.center.uint16;
        //Serial.println(delta);
        if (delta > 0 && delta > axis.backlash.int16)
        {
            axis.pos.int16 = map(newValue, axis.calibration.center.uint16, axis.calibration.max.uint16, 0, 1000);
            return true;
        }

        if (delta < 0 && delta < -axis.backlash.int16)
        {
            axis.pos.int16 = map(newValue, axis.calibration.min.uint16, axis.calibration.center.uint16, -1000, 0);
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