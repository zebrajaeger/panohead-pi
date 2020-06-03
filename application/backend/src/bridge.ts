import {I2CBus} from 'i2c-bus';

export interface Axis {
    isAtPosition: boolean;
    position: number;
}

export interface Actor {
    x: Axis;
    y: Axis;
}

export interface Joystick {
    x: number;
    y: number;
}

export interface Camera {
    isFocussing: boolean;
    isTriggering: boolean;
}

export interface Status {
    actor: Actor;
    joystick: Joystick;
    camera: Camera;
}

enum Commands {
    writeLimit = 0,
    writeVelocity = 20,
    writePos = 21,

    triggerCameraFocus = 30,
    triggerCameraTrigger = 31,
}

export class Bridge {

    constructor(private i2c: I2CBus, private i2cAddress: number) {
    }

    writeLimit(axis: number, velocityMinHz: number, velocityMaxHz: number, accelerationMaxHzPerSecond: number): void {
        let buffer = Buffer.alloc(11);
        this.write8(buffer, 0, Commands.writeLimit);
        this.write8(buffer, 1, axis);
        this.write24(buffer, 2, velocityMinHz);
        this.write24(buffer, 5, velocityMaxHz);
        this.write24(buffer, 8, accelerationMaxHzPerSecond);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    writePos(axis: number, pos: number): void {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.writePos);
        this.write8(buffer, 1, axis);
        this.write24(buffer, 2, pos);
        console.log(buffer);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    writeVelocity(axis: number, velocity: number): void {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.writeVelocity);
        this.write8(buffer, 1, axis);
        this.write24(buffer, 2, velocity);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    triggerCameraFocus(durationMs: number) {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.triggerCameraFocus);
        this.write32(buffer, 1, durationMs);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    triggerCameraTrigger(durationMs: number) {
        let buffer = Buffer.alloc(5);
        this.write8(buffer, 0, Commands.triggerCameraTrigger);
        this.write32(buffer, 1, durationMs);
        this.i2c.i2cWriteSync(this.i2cAddress, buffer.length, buffer);
    }

    readStatus(): Status {
        let result: Status = {
            actor: {
                x: {isAtPosition: true, position: 0},
                y: {isAtPosition: true, position: 0}
            },
            joystick: {x: 0, y: 0},
            camera: {isFocussing: false, isTriggering: false}
        }

        let buffer = Buffer.alloc(12);
        this.i2c.i2cReadSync(this.i2cAddress, buffer.length, buffer);

        result.actor.x.position = this.readI24(buffer, 0);
        result.actor.y.position = this.readI24(buffer, 3);

        let temp = this.readU8(buffer, 6);
        result.actor.x.isAtPosition = (temp & 0x01) != 0;
        result.actor.y.isAtPosition = (temp & 0x02) != 0;

        result.joystick.x = this.readI16(buffer, 7);
        result.joystick.y = this.readI16(buffer, 9);

        temp = this.readU8(buffer, 11);
        result.camera.isFocussing = (temp & 0x01) !== 0;
        result.camera.isTriggering = (temp & 0x02) !== 0;

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