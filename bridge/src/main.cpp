
#include "default_config.h"
#include <Arduino.h>
#include <avr/boot.h>

#include <Wire.h>

#include "types.h"
#include "wireutils.h"
#include "stepperdriver.h"

void requestEvent();
void receiveEvent(int howMany);

// W: <Index> <Value>
// W: <Index> R: <Value>+
enum command_t
{
    writeLimit = 0,

    writeVelocity = 20,
    writePos = 21,

    unknown = 127
};

typedef struct
{
    u16_t raw;
    u16_t center;
    u16_t backlash;
    u16_t pos;
} JoystickAxis_t;

typedef struct
{
    JoystickAxis_t x;
    JoystickAxis_t y;
} Joystick_t;

StepperDriver stepperDriver;
command_t command_ = unknown;
uint8_t axis_ = 0;
Joystick_t joystick;

// -----------------------------------------------------------------------------
void setup()
// -----------------------------------------------------------------------------
{
    Serial.begin(115200);

    // LEDs
    pinMode(LED_MOVE_PIN_1, OUTPUT);
    digitalWrite(LED_MOVE_PIN_1, false);
    pinMode(LED_MOVE_PIN_2, OUTPUT);
    digitalWrite(LED_MOVE_PIN_2, false);
    pinMode(LED_JOYSTICK_PIN, OUTPUT);
    digitalWrite(LED_JOYSTICK_PIN, false);

    // I²C
    Wire.begin(I2C_ADDRESS);
    Wire.onRequest(requestEvent);
    Wire.onReceive(receiveEvent);

    // Fuses
    uint8_t lowBits = boot_lock_fuse_bits_get(GET_LOW_FUSE_BITS);
    uint8_t highBits = boot_lock_fuse_bits_get(GET_HIGH_FUSE_BITS);
    uint8_t extendedBits = boot_lock_fuse_bits_get(GET_EXTENDED_FUSE_BITS);
    uint8_t lockBits = boot_lock_fuse_bits_get(GET_LOCK_BITS);
    Serial.print("Low:  0x");
    Serial.println(lowBits, HEX);
    Serial.print("High: 0x");
    Serial.println(highBits, HEX);
    Serial.print("Ext:  0x");
    Serial.println(extendedBits, HEX);
    Serial.print("Lock: 0x");
    Serial.println(lockBits, HEX);

    // check that clockout is set
    if ((lowBits & 0x40) != 0)
    {
        Serial.println("ERROR: CKOUT-bit on low-efuse is set. That mean the TMC429 has no 16MHz clock and cannot work.");
        pinMode(LED_BUILTIN, OUTPUT);
        for (;;)
        {
            digitalWrite(LED_BUILTIN, 1);
            delay(25);
            digitalWrite(LED_BUILTIN, 0);
            delay(150);
        }
    }

    // TMC429
    StepperDriver::Limit_t limit = {16 * 10, 200 * 16 * 7, 75000};
    StepperDriver::Limit_t limits[3] = {limit, limit, limit};
    if (stepperDriver.setup(CS_PIN, TMC_CLOCK_MHZ, limits))
    {
        Serial.println("StepperDriver initialized");
    }
    else
    {
        Serial.println("ERROR: StepperDriver NOT initialized");
    }

    // Joystick
    analogReference(DEFAULT);
    joystick.x.pos.uint16 = 0;
    joystick.y.pos.uint16 = 0;
    joystick.x.backlash.uint16 = 1;
    joystick.y.backlash.uint16 = 1;
    joystick.x.center.uint16 = analogRead(JOYSTICK_X_PIN);
    joystick.y.center.uint16 = analogRead(JOYSTICK_Y_PIN);
}

// -----------------------------------------------------------------------------
bool calJoystickValue(JoystickAxis_t &axis, uint16_t newValue)
// -----------------------------------------------------------------------------
{
    axis.raw.uint16 = newValue;
    int16_t delta = newValue - axis.center.uint16;
    if (delta > 0 && delta > axis.backlash.uint16)
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

// -----------------------------------------------------------------------------
void loop()
// -----------------------------------------------------------------------------
{
    stepperDriver.loop();
    // Serial.println(stepperDriver.getPos(0).int32);
    delay(100);
    digitalWrite(LED_MOVE_PIN_1, stepperDriver.isMoving(0));
    digitalWrite(LED_MOVE_PIN_2, stepperDriver.isMoving(1));

    bool jogging = false;
    jogging |= calJoystickValue(joystick.x, analogRead(JOYSTICK_X_PIN));
    jogging |= calJoystickValue(joystick.y, analogRead(JOYSTICK_Y_PIN));
    digitalWrite(LED_JOYSTICK_PIN, jogging);
}

// -----------------------------------------------------------------------------
void requestEvent()
// -----------------------------------------------------------------------------
{
    //u32_t  v;
    //v.uint32 = 0x01020304;
    //Serial.print(stepperDriver.getPos(0).uint32, HEX);
    //WireUtils::write24(v);            // 3
    WireUtils::write24(stepperDriver.getPos(0));            // 3
    WireUtils::write24(stepperDriver.getPos(1));            // 3
    WireUtils::write8(stepperDriver.getIsAtTargetPos().u8); // 1
    WireUtils::write16(joystick.x.pos);                     // 2
    WireUtils::write16(joystick.y.pos);                     // 2
    //Serial.println(stepperDriver.getPos(1).int32);
    //Serial.print(stepperDriver.getPos(0).uint32, HEX);
}

// -----------------------------------------------------------------------------
void receiveEvent(int howMany)
// -----------------------------------------------------------------------------
{
    Serial.print("receiveEvent n:");
    Serial.println(howMany);
    /*for(uint8_t i=0; i<howMany; ++i){
        Serial.print("  ");
        Serial.println(Wire.read());
    } */

    if (Wire.available() > 1)
    {
        command_ = (command_t)Wire.read();
        axis_ = Wire.read();

        switch (command_)
        {
        case writePos:
        {
            // Serial.print("receiveEvent: writePos; axis: ");
            // Serial.print(axis_);
            // Serial.print("; pos: ");
            u32_t u32;
            if (WireUtils::read24(u32))
            {
                Serial.println(u32.int32);
                Serial.println(u32.int32,HEX);
                stepperDriver.setPos(axis_, u32);
            }
            else
            {
                // Serial.println("!!!got no pos!!");
            }
        }
        break;

        case writeVelocity:
        {
            u32_t u32;
            if (WireUtils::read24(u32))
            {
                // Serial.print("receiveEvent: writeVelocity; axis: ");
                // Serial.print(axis_);
                // Serial.println("; pos");
                // Serial.println(u32.int32);

                stepperDriver.setVelocity(axis_, u32);
            }
        }
        break;

        case writeLimit:
        {
            u32_t velocityMinHz;
            u32_t velocityMaxHz;
            u32_t accelerationMaxHzPerSecond;

            Serial.print("receiveEvent: writeLimit; axis: ");
            Serial.print(axis_);

            if (WireUtils::read32(velocityMinHz) && WireUtils::read32(velocityMaxHz) && WireUtils::read32(accelerationMaxHzPerSecond))
            {
                Serial.print("; velocityMinHz: ");
                Serial.print(velocityMinHz.int32);

                Serial.print("; velocityMaxHz: ");
                Serial.print(velocityMaxHz.int32);

                Serial.print("; accelerationMaxHzPerSecond: ");
                Serial.println(accelerationMaxHzPerSecond.int32);

                StepperDriver::Limit_t limit;
                limit.velocityMinHz = velocityMinHz.uint32;
                limit.velocityMaxHz = velocityMaxHz.uint32;
                limit.acceleration_max_hz_per_s = accelerationMaxHzPerSecond.uint32;
                stepperDriver.setLimit(axis_, limit);
            }
            else
            {
                Serial.println("; NOT ENOUGH DATA");
            }
        }
        break;

        default:
        {
            Serial.print("receiveEvent: UNKOWN COMMAND: ");
            Serial.println(command_);
        }
        }
    }

    // remove all pending data because it would suppress next call of this function
    while (Wire.available() > 0)
    {
        Wire.read();
    }
}
