#pragma once

#include <Arduino.h>
#include "types.h"
#include "timer.h"

class Camera
{
public:
    typedef union {
        struct
        {
            bool focus : 1;
            bool trigger : 1;
        } fields;
        u8_t u8;
    } Status_t;

    bool setup(uint8_t focusPin, uint8_t triggerPin)
    {
        focusPin_ = focusPin;
        triggerPin_ = triggerPin;
        return true;
    }

    void loop()
    {
        focusTimer_.loop();
        triggerTimer_.loop();
    }

    void startFocus(u32_t ms)
    {
        focusTimer_.trigger(ms.uint32);
    }

    bool isFocusing()
    {
        return focusTimer_.isRunning();
    }

    void startTrigger(u32_t ms)
    {
        triggerTimer_.trigger(ms.uint32);
    }

    bool isTriggering()
    {
        return triggerTimer_.isRunning();
    }

    Status_t getStatus()
    {
        Status_t result;
        result.u8.uint8 = 0;
        result.fields.focus = focusTimer_.isRunning();
        result.fields.trigger = triggerTimer_.isRunning();
        return result;
    }

private:
    uint8_t focusPin_;
    uint8_t triggerPin_;
    Timer focusTimer_;
    Timer triggerTimer_;
};