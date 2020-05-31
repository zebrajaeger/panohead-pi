#pragma once

#include <Arduino.h>
#include <SPI.h>

#include <TMC429.h>

#include "types.h"

class StepperDriver
{
public:
    typedef struct
    {
        uint32_t velocityMinHz;
        uint32_t velocityMaxHz;
        uint32_t acceleration_max_hz_per_s;
    } Limit_t;

    typedef struct
    {
        u32_t pos;
        bool isMoving;
    } Stepper_t;

    typedef union {
        struct
        {
            uint8_t atTargetPosition0 : 1;
            uint8_t atTargetPosition1 : 1;
            uint8_t atTargetPosition2 : 1;
        } fields;
        u8_t u8;
    } IsAtTargetPos_t;

    //------------------------------------------------------------------------------
    StepperDriver() : tmc429_()
    //------------------------------------------------------------------------------
    {
        memset(&status_, 0, sizeof (struct TMC429::Status));
    }

    //------------------------------------------------------------------------------
    bool setup(uint8_t pinCS, uint8_t clockMHz, Limit_t limits[3])
    //------------------------------------------------------------------------------
    {
        tmc429_.setup(pinCS, clockMHz);
        if (tmc429_.communicating())
        {
            tmc429_.initialize();
            tmc429_.disableRightSwitches();
            tmc429_.setSwitchesActiveLow();

            for (uint8_t i = 0; i < 3; ++i)
            {
                initMotor(i, &(limits[i]));
            }

            return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------
    bool isCommunicatin()
    //------------------------------------------------------------------------------
    {
        return tmc429_.communicating();
    }

    //------------------------------------------------------------------------------
    void loop()
    //------------------------------------------------------------------------------
    {
        status_ = tmc429_.getStatus();
        steppers_[0].isMoving = !status_.at_target_position_0;
        steppers_[1].isMoving = !status_.at_target_position_1;
        steppers_[2].isMoving = !status_.at_target_position_2;
        for (uint8_t i = 0; i < 3; ++i)
        {
            steppers_[i].pos.uint32 = tmc429_.getActualPosition(i);
        }
    }

    //------------------------------------------------------------------------------
    void initMotor(uint8_t axisIndex, Limit_t *limit)
    //------------------------------------------------------------------------------
    {
        tmc429_.stop(axisIndex); // velocity mode, speed 0
        tmc429_.setLimitsInHz(axisIndex, limit->velocityMinHz, limit->velocityMaxHz, limit->acceleration_max_hz_per_s);
        tmc429_.setActualPosition(axisIndex, 0);
        tmc429_.setTargetPosition(axisIndex, 0);
        tmc429_.disableLeftSwitchStop(axisIndex);
        tmc429_.disableRightSwitchStop(axisIndex);
        tmc429_.disableSwitchSoftStop(axisIndex);

        tmc429_.setSoftMode(axisIndex);
    }

    //------------------------------------------------------------------------------
    void setPos(uint8_t axisIndex, const u32_t &value)
    //------------------------------------------------------------------------------
    {
        tmc429_.setSoftMode(axisIndex);
        tmc429_.setTargetPosition(axisIndex, value.int32);
    }

    //------------------------------------------------------------------------------
    void setVelocity(uint8_t axisIndex, const u32_t &value)
    //------------------------------------------------------------------------------
    {
        tmc429_.setVelocityMode(axisIndex);
        tmc429_.setTargetVelocityInHz(axisIndex, value.int32);
    }

    //------------------------------------------------------------------------------
    void setLimit(uint8_t axisIndex, const Limit_t &limit)
    //------------------------------------------------------------------------------
    {
        tmc429_.setLimitsInHz(axisIndex, limit.velocityMinHz, limit.velocityMaxHz, limit.acceleration_max_hz_per_s);
    }

    //------------------------------------------------------------------------------
    bool isMoving(const uint8_t axisIndex) const
    //------------------------------------------------------------------------------
    {
        return steppers_[axisIndex].isMoving;
    }

    //------------------------------------------------------------------------------
    const u32_t &getPos(const uint8_t axisIndex) const
    //------------------------------------------------------------------------------
    {
        return steppers_[axisIndex].pos;
    }

    //------------------------------------------------------------------------------
    TMC429::Status getStatus()
    //------------------------------------------------------------------------------
    {
        return status_;
    }

    //------------------------------------------------------------------------------
    IsAtTargetPos_t getIsAtTargetPos()
    //------------------------------------------------------------------------------
    {
        IsAtTargetPos_t res;
        memset(&res, 0, sizeof res);

        res.fields.atTargetPosition0 = status_.at_target_position_0;
        res.fields.atTargetPosition1 = status_.at_target_position_1;
        res.fields.atTargetPosition2 = status_.at_target_position_2;

        return res;
    }

private:
    TMC429 tmc429_;
    Stepper_t steppers_[3];
    TMC429::Status status_;
};