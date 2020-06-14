import {Status} from './wsInterface';

const log4js = require("log4js");
const LOG = log4js.getLogger('bridge');
LOG.level = "debug";

import {I2CBus} from 'i2c-bus';

enum Commands {
    stepperWriteLimit = 0x20,
    stepperWriteVelocity = 0x21,
    stepperWritePos = 0x22,

    cameraStartFocus = 0x30,
    cameraStartTrigger = 0x31,
    cameraStartShot = 0x32,

    joystickCalibrateAsTopLeft = 0x40,
    joystickCalibrateAsCenter = 0x41,
    joystickCalibrateAsBottomRight = 0x42,

    joystickSetBacklash = 0x50
}

export class Bridge {

    constructor(private i2c: I2CBus, private i2cAddress: number) {
    }

    stepperWriteLimit(axis: number, velocityMinHz: number, velocityMaxHz: number, accelerationMaxHzPerSecond: number): void {
        let buffer = Buffer.alloc(11);
        this.write8(buffer, 0, Commands.stepperWriteLimit);
        this.write8(buffer, 1, axis);
        this.write24(buffer, 2, velocityMinHz);
        this.write24(buffer, 5, velocityMaxHz);
        this.write24(buffer, 8, accelerationMaxHzPerSecond);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    stepperWritePos(axis: number, pos: number): void {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.stepperWritePos);
        this.write8(buffer, 1, axis);
        this.write24(buffer, 2, pos);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    stepperWriteVelocity(axis: number, velocity: number): void {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.stepperWriteVelocity);
        this.write8(buffer, 1, axis);
        this.write24(buffer, 2, velocity);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    cameraStartFocus(durationMs: number) {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.cameraStartFocus);
        this.write32(buffer, 1, durationMs);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    cameraStartTrigger(durationMs: number) {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.cameraStartTrigger);
        this.write32(buffer, 1, durationMs);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    cameraStartShot(focusMs: number, triggerMs: number) {
        let buffer = Buffer.alloc(9);
        this.write8(buffer, 0, Commands.cameraStartShot);
        this.write32(buffer, 1, focusMs);
        this.write32(buffer, 5, triggerMs);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    joystickCalibrateAsTopLeft() {
        LOG.debug('joystickCalibrateAsTopLeft()');
        let buffer = Buffer.alloc(1);
        this.write8(buffer, 0, Commands.joystickCalibrateAsTopLeft);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    joystickCalibrateAsCenter() {
        LOG.debug('joystickCalibrateAsCenter()');
        let buffer = Buffer.alloc(1);
        this.write8(buffer, 0, Commands.joystickCalibrateAsCenter);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    joystickCalibrateAsBottomRight() {
        LOG.debug('joystickCalibrateAsBottomRight()');
        let buffer = Buffer.alloc(1);
        this.write8(buffer, 0, Commands.joystickCalibrateAsBottomRight);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    joystickSetBacklash(x1: number, x2: number, y1: number, y2: number) {
        LOG.debug('joystickSetBacklash()');
        let buffer = Buffer.alloc(9);
        this.write8(buffer, 0, Commands.joystickSetBacklash);
        this.write16(buffer, 1, x1);
        this.write16(buffer, 3, x2);
        this.write16(buffer, 5, y1);
        this.write16(buffer, 7, y2);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    readStatus(): Status {
        let result: Status = {
            actor: {
                x: {isAtPosition: true, isMoving: false, position: 0, speed: 0},
                y: {isAtPosition: true, isMoving: false, position: 0, speed: 0}
            },
            joystick: {x: 0, y: 0},
            camera: {focus: false, trigger: false}
        }

        let buffer = Buffer.alloc(16);
        this.i2c.i2cReadSync(this.i2cAddress, buffer.length, buffer);

        let temp = this.readU8(buffer, 0);
        result.actor.x.isAtPosition = (temp & 0x01) != 0;
        result.actor.x.isMoving = (temp & 0x02) != 0;
        result.actor.y.isAtPosition = (temp & 0x04) != 0;
        result.actor.y.isMoving = (temp & 0x08) != 0;

        result.actor.x.position = this.readI24(buffer, 1);
        result.actor.x.speed = this.readI16(buffer, 4);
        result.actor.y.position = this.readI24(buffer, 6);
        result.actor.y.speed = this.readI16(buffer, 9);


        result.joystick.x = this.readI16(buffer, 11);
        result.joystick.y = this.readI16(buffer, 13);

        temp = this.readU8(buffer, 15);
        result.camera.focus = (temp & 0x01) !== 0;
        result.camera.trigger = (temp & 0x02) !== 0;

        return result;
    }

    private write32(buffer: Buffer, atIndex: number, value: number) {
        buffer[atIndex] = value & 0xff;
        buffer[atIndex + 1] = value >> 8 & 0xff;
        buffer[atIndex + 2] = value >> 16 & 0xff;
        buffer[atIndex + 3] = value >> 24 & 0xff;
    }

    private readU32(buffer: Buffer, atIndex: number) {
        return buffer[atIndex + 3] << 24 | buffer[atIndex + 2] << 16 | buffer[atIndex + 1] << 8 | buffer[atIndex];
    }

    private write24(buffer: Buffer, atIndex: number, value: number) {
        buffer[atIndex] = value & 0xff;
        buffer[atIndex + 1] = value >> 8 & 0xff;
        buffer[atIndex + 2] = value >> 16 & 0xff;
    }

    private readU24(buffer: Buffer, atIndex: number) {
        return buffer[atIndex + 2] << 16 | buffer[atIndex + 1] << 8 | buffer[atIndex];
    }

    private readI24(buffer: Buffer, atIndex: number) {
        let v = this.readU24(buffer, atIndex);
        if (v & 0x800000) {
            return -0x1000000 + v;
        } else {
            return v;
        }
    }

    private write16(buffer: Buffer, atIndex: number, value: number) {
        buffer[atIndex] = value & 0xff;
        buffer[atIndex + 1] = value >> 8 & 0xff;
    }

    private readU16(buffer: Buffer, atIndex: number) {
        return buffer[atIndex] | buffer[atIndex + 1] << 8;
    }

    private readI16(buffer: Buffer, atIndex: number) {
        let v = this.readU16(buffer, atIndex);
        if (v & 0x8000) {
            return -0x10000 + v;
        } else {
            return v;
        }
    }

    private write8(buffer: Buffer, atIndex: number, value: number) {
        return buffer[atIndex] = value & 0xff;
    }

    private readU8(buffer: Buffer, atIndex: number) {
        return buffer[atIndex];
    }
}