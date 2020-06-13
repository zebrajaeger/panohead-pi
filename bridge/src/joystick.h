#pragma once

#include <Arduino.h>
#include "types.h"
#include <avr/pgmspace.h>

class Joystick
{
public:
    struct Calibration
    {

        u16_t min;
        u16_t center;
        u16_t max;
        u16_t backlash1;
        u16_t backlash2;
    };

    struct Axis
    {
        Calibration calibration;
        u16_t raw;
        u16_t pos;
    };

    Joystick() {}

    // -----------------------------------------------------------------------------
    void dumpCalibration()
    // -----------------------------------------------------------------------------
    {
        Serial.print(F("X:"));
        Serial.print(F(" min:"));
        Serial.print(x_.calibration.min.int16);
        Serial.print(F(" cnt:"));
        Serial.print(x_.calibration.center.int16);
        Serial.print(F(" max:"));
        Serial.print(x_.calibration.max.int16);
        Serial.print(F(" bl1:"));
        Serial.print(x_.calibration.backlash1.int16);
        Serial.print(F(" bl2:"));
        Serial.println(x_.calibration.backlash2.int16);

        Serial.print(F("Y:"));
        Serial.print(F(" min:"));
        Serial.print(y_.calibration.min.int16);
        Serial.print(F(" cnt:"));
        Serial.print(y_.calibration.center.int16);
        Serial.print(F(" max:"));
        Serial.print(y_.calibration.max.int16);
        Serial.print(F(" bl1:"));
        Serial.print(y_.calibration.backlash1.int16);
        Serial.print(F(" bl2:"));
        Serial.println(y_.calibration.backlash2.int16);
    }

    // -----------------------------------------------------------------------------
    void dumpValue()
    // -----------------------------------------------------------------------------
    {
        Serial.print(F("Joystick:{"));
        Serial.print(F(" X:{"));
        Serial.print(F("raw:"));
        Serial.print(x_.raw.int16);
        Serial.print(F(",pos:"));
        Serial.print(x_.pos.int16);

        Serial.print(F("}, Y:{"));
        Serial.print(F("raw:"));
        Serial.print(y_.raw.int16);
        Serial.print(F(",pos:"));
        Serial.print(y_.pos.int16);

        Serial.println(F("} }"));
    }

    // -----------------------------------------------------------------------------
    bool setup(uint8_t pinX, uint8_t pinY)
    // -----------------------------------------------------------------------------
    {
        pinX_ = pinX;
        pinY_ = pinY;
        analogReference(EXTERNAL); // connect aref to 3.3V of joystick

        x_.pos.uint16 = 0;
        x_.calibration.backlash1.uint16 = 2;
        x_.calibration.backlash2.uint16 = 2;

        y_.pos.uint16 = 0;
        y_.calibration.backlash1.uint16 = 2;
        y_.calibration.backlash2.uint16 = 2;

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
        if (delta > 0 && delta > axis.calibration.backlash1.int16)
        {
            axis.pos.int16 = map(newValue, axis.calibration.center.uint16, axis.calibration.max.uint16, 0, 1000);
            return true;
        }

        if (delta < 0 && delta < -axis.calibration.backlash2.int16)
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