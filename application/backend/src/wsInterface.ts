export interface Overlap {
    x: number;
    y: number;
}

export interface Timing {
    delayAfterMove: number;
    delayBetweenShots: number;
    delayAfterLastShot: number;
}

export interface Shot {
    focusTime: number;
    triggerTime: number;
}

// status
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
    focus: boolean;
    trigger: boolean;
}

export interface Status {
    actor: Actor;
    joystick: Joystick;
    camera: Camera;
}

// FOV
export interface Point {
    x: number;
    y: number;
}

export interface FOV {
    a: Point;
    b: Point;
}

export interface PanoFOV extends FOV {
    partial: boolean;
}

export interface Pano {
    x: number[],
    y: number[],
}

export const wsNames = {
    TIMING: 'timing',
    SHOTS: 'shots',
    STATUS: 'status',
    JOGGING: 'jogging',
    IMAGE_FOV: 'imageFov',
    PANO_FOV: 'panoFov',
    OVERLAP: 'overlap',
    PANO: 'pano',
}
