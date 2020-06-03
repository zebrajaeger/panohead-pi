
#include "default_config.h"
#include <Arduino.h>
#include <avr/boot.h>

#include <Wire.h>

#include "types.h"
#include "wireutils.h"
#include "stepperdriver.h"

#include "joystick.h"
#include "camera.h"
#include "eeprom.h"

enum command_t
{
    stepperWriteLimit = 0x20,
    stepperWriteVelocity = 0x21,
    stepperWritePos = 0x22,

    cameraStartFocus = 0x30,
    cameraStartTrigger = 0x31,

    joystickCalibrateAsTopLeft = 0x40,
    joystickCalibrateAsCenter = 0x41,
    joystickCalibrateAsBottomRight = 0x42,

    unknown = 127
};

StepperDriver stepperDriver;
command_t command_ = unknown;

Joystick joystick;
Camera camera;
Eeprom eeprom;

// -----------------------------------------------------------------------------
void requestEvent()
// -----------------------------------------------------------------------------
{
    WireUtils::write24(stepperDriver.getPos(0));            // 3
    WireUtils::write24(stepperDriver.getPos(1));            // 3
    WireUtils::write8(stepperDriver.getIsAtTargetPos().u8); // 1
    WireUtils::write16(joystick.getX().pos);                // 2
    WireUtils::write16(joystick.getY().pos);                // 2
    WireUtils::write8(camera.getStatus().u8);               // 1
}

// -----------------------------------------------------------------------------
void onWritePos()
// -----------------------------------------------------------------------------
{
    u8_t axis;
    u32_t pos;
    if (WireUtils::read8(axis) && WireUtils::read24(pos))
    {
        stepperDriver.setPos(axis.uint8, pos);
    }
    else
    {
        Serial.println("; NOT ENOUGH DATA");
    }
}
// -----------------------------------------------------------------------------
void onWriteVelocity()
// -----------------------------------------------------------------------------
{
    u8_t axis;
    u32_t velocity;
    if (WireUtils::read8(axis) && WireUtils::read24(velocity))
    {
        stepperDriver.setVelocity(axis, velocity);
    }
    else
    {
        Serial.println("; NOT ENOUGH DATA");
    }
}
// -----------------------------------------------------------------------------
void onWriteLimit()
// -----------------------------------------------------------------------------
{
    u8_t axis;
    u32_t velocityMinHz;
    u32_t velocityMaxHz;
    u32_t accelerationMaxHzPerSecond;

    if (WireUtils::read8(axis) && WireUtils::read32(velocityMinHz) && WireUtils::read32(velocityMaxHz) && WireUtils::read32(accelerationMaxHzPerSecond))
    {
        StepperDriver::Limit_t limit;
        limit.velocityMinHz = velocityMinHz.uint32;
        limit.velocityMaxHz = velocityMaxHz.uint32;
        limit.acceleration_max_hz_per_s = accelerationMaxHzPerSecond.uint32;
        stepperDriver.setLimit(axis, limit);
    }
    else
    {
        Serial.println("; NOT ENOUGH DATA");
    }
}
// -----------------------------------------------------------------------------
void onTriggerCameraFocus()
// -----------------------------------------------------------------------------
{
    u32_t ms;
    if (WireUtils::read24(ms))
    {
        camera.startFocus(ms);
    }
}
// -----------------------------------------------------------------------------
void onTriggerCameraTrigger()
// -----------------------------------------------------------------------------
{
    u32_t ms;
    if (WireUtils::read24(ms))
    {
        camera.startTrigger(ms);
    }
}

// -----------------------------------------------------------------------------
void onJoystickCalibrateAsTopLeft()
// -----------------------------------------------------------------------------
{
    Serial.print("onJoystickCalibrateAsTopLeft()");

    u16_t x = joystick.getX().raw;
    joystick.getXCalibration().min = x;
    eeprom.write16(Eeprom::JOYSTICK_X_MIN, x);
    Serial.print(x.uint16);
    Serial.print(" ");

    u16_t y = joystick.getY().raw;
    joystick.getYCalibration().min = y;
    eeprom.write16(Eeprom::JOYSTICK_Y_MIN, y);
    Serial.print(y.uint16);
    Serial.println();

    eeprom.recalculateAndWriteCRC();
}

// -----------------------------------------------------------------------------
void onJoystickCalibrateAsCenter()
// -----------------------------------------------------------------------------
{
    Serial.print("onJoystickCalibrateAsCenter()");

    u16_t x = joystick.getX().raw;
    joystick.getXCalibration().center = x;
    eeprom.write16(Eeprom::JOYSTICK_X_CENTER, x);
    Serial.print(x.uint16);
    Serial.print(" ");

    u16_t y = joystick.getY().raw;
    joystick.getYCalibration().center = y;
    eeprom.write16(Eeprom::JOYSTICK_Y_CENTER, y);
    Serial.print(y.uint16);
    Serial.println();

    eeprom.recalculateAndWriteCRC();
}

// -----------------------------------------------------------------------------
void onJoystickCalibrateAsBottomRight()
// -----------------------------------------------------------------------------
{
    Serial.print("onJoystickCalibrateAsBottomRight()");

    u16_t x = joystick.getX().raw;
    joystick.getXCalibration().max = x;
    eeprom.write16(Eeprom::JOYSTICK_X_MAX, x);
    Serial.print(x.uint16);
    Serial.print(" ");

    u16_t y = joystick.getY().raw;
    joystick.getYCalibration().max = y;
    eeprom.write16(Eeprom::JOYSTICK_Y_MAX, y);
    Serial.print(y.uint16);
    Serial.println();

    eeprom.recalculateAndWriteCRC();
}

// -----------------------------------------------------------------------------
void receiveEvent(int howMany)
// -----------------------------------------------------------------------------
{
    Serial.print("receiveEvent n:");
    Serial.println(howMany);
    /*
    for(uint8_t i=0; i<howMany; ++i){
        Serial.print("  ");
        Serial.println(Wire.read());
    } 
    */

    u8_t temp;
    if (WireUtils::read8(temp))
    {
        command_ = (command_t)temp.uint8;
        switch (command_)
        {
        case stepperWriteLimit:
            onWriteLimit();
            break;
        case stepperWritePos:
            onWritePos();
            break;
        case stepperWriteVelocity:
            onWriteVelocity();
            break;
        case cameraStartFocus:
            onTriggerCameraFocus();
            break;
        case cameraStartTrigger:
            onTriggerCameraTrigger();
            break;
        case joystickCalibrateAsTopLeft:
            onJoystickCalibrateAsTopLeft();
            break;
        case joystickCalibrateAsCenter:
            onJoystickCalibrateAsCenter();
            break;
        case joystickCalibrateAsBottomRight:
            onJoystickCalibrateAsBottomRight();
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

// -----------------------------------------------------------------------------
void setup()
// -----------------------------------------------------------------------------
{
    Serial.begin(115200);

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

    // EEPROM
    if (eeprom.setup())
    {
        Serial.println("EEPROM initialized");
        eeprom.dump();
    }
    else
    {
        Serial.println("ERROR: EEPROM NOT initialized");
    }

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
    if (joystick.setup(JOYSTICK_X_PIN, JOYSTICK_Y_PIN))
    {
        Serial.println("Joystick initialized");
        joystick.getXCalibration().min = eeprom.read16(Eeprom::JOYSTICK_X_MIN);
        joystick.getXCalibration().center = eeprom.read16(Eeprom::JOYSTICK_X_CENTER);
        joystick.getXCalibration().max = eeprom.read16(Eeprom::JOYSTICK_X_MAX);
        Serial.println("x");
        Serial.println(joystick.getXCalibration().min.uint16);
        Serial.println(joystick.getXCalibration().center.uint16);
        Serial.println(joystick.getXCalibration().max.uint16);

        joystick.getYCalibration().min = eeprom.read16(Eeprom::JOYSTICK_Y_MIN);
        joystick.getYCalibration().center = eeprom.read16(Eeprom::JOYSTICK_Y_CENTER);
        joystick.getYCalibration().max = eeprom.read16(Eeprom::JOYSTICK_X_MAX);
        Serial.println("y");
        Serial.println(joystick.getXCalibration().min.uint16);
        Serial.println(joystick.getXCalibration().center.uint16);
        Serial.println(joystick.getXCalibration().max.uint16);
    }
    else
    {
        Serial.println("ERROR: Joystick NOT initialized");
    }

    //Camera
    if (camera.setup(CAMERA_FOCUS_PIN, CAMERA_TRIGGER_PIN))
    {
        Serial.println("Camera initialized");
    }
    else
    {
        Serial.println("ERROR: Camera NOT initialized");
    }
}

// -----------------------------------------------------------------------------
void loop()
// -----------------------------------------------------------------------------
{
    stepperDriver.loop();
    digitalWrite(LED_MOVE_PIN_1, stepperDriver.isMoving(0));
    digitalWrite(LED_MOVE_PIN_2, stepperDriver.isMoving(1));

    joystick.loop();
    digitalWrite(LED_JOYSTICK_PIN, joystick.getIsJogging());

    camera.loop();
}
