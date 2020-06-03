#pragma once

#include <Arduino.h>

class Timer
{
public:
    Timer() : isRunning_(false), durationMs_(0), nextEventTime_(0) {}

    virtual void trigger(uint32_t durationMs)
    {
        durationMs_ = durationMs;
        isRunning_ = true;
        nextEventTime_ = millis() + durationMs_;
    }

    virtual void onTimer() = 0;

    bool isRunning()
    {
        return isRunning_;
    }

    void loop()
    {
        if (isRunning_)
        {
            uint32_t now = millis();
            if (now >= nextEventTime_)
            {
                isRunning_ = false;
                onTimer();
            }
        }
    }

private:
    bool isRunning_;
    uint32_t durationMs_;
    uint32_t nextEventTime_;
};