#pragma once

#include <Arduino.h>
#include <EEPROM.h>

#include "types.h"

class Eeprom
{
public:
    typedef enum
    {
        CRC = (uint16_t)0,
        FIRST_VALUE = (uint16_t)4,
        JOYSTICK_X_MIN = (uint16_t)4,
        JOYSTICK_X_CENTER = (uint16_t)8,
        JOYSTICK_X_MAX = (uint16_t)12,
        JOYSTICK_Y_MIN = (uint16_t)16,
        JOYSTICK_Y_CENTER = (uint16_t)20,
        JOYSTICK_Y_MAX = (uint16_t)24
    } EepromAdr_t;

    Eeprom()
    {
    }

    void dump()
    {
        uint16_t i = 0;
        while (i < EEPROM.length())
        {
            uint8_t x = EEPROM[i];
            if (x < 0x10)
                Serial.print("0");
            Serial.print(x, HEX);
            if ((i+1) % 16 == 0)
                Serial.println();
            else
            {
                if ((i+1) % 4 == 0)
                    Serial.print("  ");
                else
                    Serial.print(" ");
            }
            ++i;
        }
    }

    bool setup()
    {
        if (!isCRCOk())
        {
            Serial.println("recreate CRC");
            writeRange(FIRST_VALUE, (EepromAdr_t)EEPROM.length(), 0);
            recalculateAndWriteCRC();
        }
        return true;
    }

    void recalculateAndWriteCRC()
    {
        write32(CRC, crc(FIRST_VALUE, (EepromAdr_t)EEPROM.length()));
    }

    bool isCRCOk()
    {
        u32_t expectedCRC = read32(CRC);
        u32_t calculatedCRC = crc(FIRST_VALUE, (EepromAdr_t)EEPROM.length());
        Serial.print("CRC ");
        Serial.print(expectedCRC.uint32, HEX);
        Serial.print(" ");
        Serial.print(calculatedCRC.uint32, HEX);
        bool result = expectedCRC.uint32 == calculatedCRC.uint32;
        Serial.println(result?" ok": "failed");
        return result;
    }

    void writeRange(EepromAdr_t startAdr, EepromAdr_t endAdr, uint8_t value)
    {
        for (uint16_t i = startAdr; i < EEPROM.length() && i < endAdr; ++i)
        {
            EEPROM[i] = value;
        }
    }

    void write32(EepromAdr_t adr, u32_t value)
    {
        EEPROM[adr] = value.uint32 >> 24 & 0xff;
        EEPROM[adr + 1] = value.uint32 >> 16 & 0xff;
        EEPROM[adr + 2] = value.uint32 >> 8 & 0xff;
        EEPROM[adr + 3] = value.uint32 & 0xff;
    }
    u32_t read32(EepromAdr_t adr)
    {
        u32_t result;
        result.uint32 = EEPROM[adr];
        result.uint32 = (result.uint32 << 8) | EEPROM[adr + 1];
        result.uint32 = (result.uint32 << 8) | EEPROM[adr + 2];
        result.uint32 = (result.uint32 << 8) | EEPROM[adr + 3];
        return result;
    }

    void write16(EepromAdr_t adr, u16_t value)
    {
        EEPROM[adr] = value.uint16 >> 8 & 0xff;
        EEPROM[adr + 1] = value.uint16 & 0xff;
    }

    u16_t read16(EepromAdr_t adr)
    {
        u16_t result;
        result.uint16 = EEPROM[adr];
        result.uint16 = (result.uint16 << 8) | EEPROM[adr + 1];
        return result;
    }

    void write8(EepromAdr_t adr, u8_t value)
    {
        EEPROM[adr] = value.uint8;
    }
    u8_t read8(EepromAdr_t adr)
    {
        u8_t result;
        result.uint8 = EEPROM[adr];
        return result;
    }

private:
    u32_t crc(EepromAdr_t startAdr, EepromAdr_t endAdr)
    {

        uint32_t crc = ~0L;

        for (uint16_t i = startAdr; i < EEPROM.length() && i < endAdr; ++i)
        {
            crc = crc_table[(crc ^ EEPROM[i]) & 0x0f] ^ (crc >> 4);
            crc = crc_table[(crc ^ (EEPROM[i] >> 4)) & 0x0f] ^ (crc >> 4);
            crc = ~crc;
        }
        u32_t result;
        result.uint32 = crc;
        return result;
    }

    const uint32_t crc_table[16] = {
        0x00000000, 0x1db71064, 0x3b6e20c8, 0x26d930ac,
        0x76dc4190, 0x6b6b51f4, 0x4db26158, 0x5005713c,
        0xedb88320, 0xf00f9344, 0xd6d6a3e8, 0xcb61b38c,
        0x9b64c2b0, 0x86d3d2d4, 0xa00ae278, 0xbdbdf21c};
};