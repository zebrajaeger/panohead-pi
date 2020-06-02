#pragma once

#include <Arduino.h>

class Timer
{
public:
    typedef void (*Callback_t)();

    Timer() : isRunnung_(false), durationMs_(0), nextEventTime_(0), callback_(NULL) {}

    void trigger(uint32_t durationMs)
    {
        durationMs_ = durationMs;
        isRunnung_ = true;
        nextEventTime_ = millis() + durationMs_;
    }

    void onTimer(Callback_t callback)
    {
        callback_ = callback;
    }

    bool isRunning()
    {
        return isRunnung_;
    }

    void loop()
    {
        uint32_t now = millis();
        if (now >= nextEventTime_)
        {
            isRunnung_ = false;
            if (callback_)
            {
                callback_();
            }
        }
    }

private:
    bool isRunnung_;
    uint32_t durationMs_;
    uint32_t nextEventTime_;
    Callback_t callback_;
};