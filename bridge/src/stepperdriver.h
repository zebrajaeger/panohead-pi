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
        u16_t speed;
        bool isAtTargetPos;
    } Stepper_t;

    typedef union {
        struct
        {
            uint8_t atTargetPosition0 : 1;
            uint8_t isMoving0 : 1;
            uint8_t atTargetPosition1 : 1;
            uint8_t isMoving1 : 1;
            uint8_t atTargetPosition2 : 1;
            uint8_t isMoving2 : 1;
        } fields;
        u8_t u8;
    } MovementStatus_t;

    //------------------------------------------------------------------------------
    StepperDriver() : tmc429_()
    //------------------------------------------------------------------------------
    {
        memset(&status_, 0, sizeof(struct TMC429::Status));
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
        steppers_[0].isAtTargetPos = status_.at_target_position_0;
        steppers_[0].pos.uint32 = tmc429_.getActualPosition(0);
        steppers_[0].speed.uint16 = tmc429_.getActualVelocityInHz(0);
        steppers_[1].isAtTargetPos = status_.at_target_position_1;
        steppers_[1].pos.uint32 = tmc429_.getActualPosition(1);
        steppers_[1].speed.uint16 = tmc429_.getActualVelocityInHz(1);

        // -----
        if (cmd_velocity_axis_0_available)
        {
            //Serial.println("cmd_velocity_axis_0_available");
            //Serial.println(cmd_velocity_axis_0_velocity.int32);
            tmc429_.setVelocityMode(0);
            tmc429_.setTargetVelocityInHz(0, cmd_velocity_axis_0_velocity.int32);
            cmd_velocity_axis_0_available = false;
        }

        if (cmd_velocity_axis_1_available)
        {
            //Serial.print("cmd_velocity_axis_1_available: ");
            //Serial.println(cmd_velocity_axis_1_velocity.int32);
            tmc429_.setVelocityMode(1);
            tmc429_.setTargetVelocityInHz(1, cmd_velocity_axis_1_velocity.int32);
            cmd_velocity_axis_1_available = false;
        }
        // -----
        if (cmd_pos_axis_0_available)
        {
            //Serial.println("cmd_pos_axis_0_available");
            //Serial.println(cmd_pos_axis_0_pos.int32);
            tmc429_.setSoftMode(0);
            tmc429_.setTargetPosition(0, cmd_pos_axis_0_pos.int32);

            cmd_pos_axis_0_available = false;
        }

        if (cmd_pos_axis_1_available)
        {
            //Serial.print("cmd_pos_axis_1_available: ");
            //Serial.println(cmd_pos_axis_0_pos.int32);
            tmc429_.setSoftMode(1);
            tmc429_.setTargetPosition(1, cmd_pos_axis_1_pos.int32);
            cmd_pos_axis_1_available = false;
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
    void setPos(u8_t axisIndex, const u32_t &value)
    //------------------------------------------------------------------------------
    {
        if (axisIndex.uint8 == 0)
        {
            cmd_pos_axis_0_available = true;
            cmd_pos_axis_0_pos.uint32 = value.uint32;
        }
        if (axisIndex.uint8 == 1)
        {
            cmd_pos_axis_1_available = true;
            cmd_pos_axis_1_pos.uint32 = value.uint32;
        }
    }

    //------------------------------------------------------------------------------
    void setVelocity(u8_t axisIndex, const u32_t &value)
    //------------------------------------------------------------------------------
    {
        if (axisIndex.uint8 == 0)
        {
            cmd_velocity_axis_0_available = true;
            cmd_velocity_axis_0_velocity.uint32 = value.uint32;
        }
        if (axisIndex.uint8 == 1)
        {
            cmd_velocity_axis_1_available = true;
            cmd_velocity_axis_1_velocity.uint32 = value.uint32;
        }
    }

    //------------------------------------------------------------------------------
    void setLimit(u8_t axisIndex, const Limit_t &limit)
    //------------------------------------------------------------------------------
    {
        tmc429_.setLimitsInHz(axisIndex.uint8, limit.velocityMinHz, limit.velocityMaxHz, limit.acceleration_max_hz_per_s);
    }

    //------------------------------------------------------------------------------
    const Stepper_t &getStepper(const uint8_t axisIndex) const
    //------------------------------------------------------------------------------
    {
        return steppers_[axisIndex];
    }

    //------------------------------------------------------------------------------
    TMC429::Status getStatus()
    //------------------------------------------------------------------------------
    {
        return status_;
    }

    //------------------------------------------------------------------------------
    MovementStatus_t getMovementStatus()
    //------------------------------------------------------------------------------
    {
        MovementStatus_t res;
        memset(&res, 0, sizeof res);

        res.fields.atTargetPosition0 = status_.at_target_position_0;
        res.fields.isMoving0 = steppers_[0].speed.uint16 != 0;
        res.fields.atTargetPosition1 = status_.at_target_position_1;
        res.fields.isMoving1 = steppers_[1].speed.uint16 != 0;
        res.fields.atTargetPosition2 = status_.at_target_position_2;
        res.fields.isMoving2 = steppers_[2].speed.uint16 != 0;

        return res;
    }

    void statistic(){
        Serial.print("Steppers: {0:");
        Serial.print(steppers_[0].pos.uint32);
        Serial.print(",1:");
        Serial.print(steppers_[1].pos.uint32);
        Serial.println("}");
    }

private:
    TMC429 tmc429_;
    Stepper_t steppers_[3];
    TMC429::Status status_;

    // TODO refactor me
    volatile bool cmd_velocity_axis_0_available;
    volatile u32_t cmd_velocity_axis_0_velocity;
    volatile bool cmd_pos_axis_0_available;
    volatile u32_t cmd_pos_axis_0_pos;

    // TODO refactor me
    volatile bool cmd_velocity_axis_1_available;
    volatile u32_t cmd_velocity_axis_1_velocity;
    volatile bool cmd_pos_axis_1_available;
    volatile u32_t cmd_pos_axis_1_pos;
};