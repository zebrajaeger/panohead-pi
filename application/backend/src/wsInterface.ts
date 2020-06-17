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

export class Shots {
    readonly shots: Shot[];

    constructor(shots: Shot[]) {
        this.shots = shots;
    }

    copy(): Shots {
        return new Shots((<Shot[]>[]).concat(this.shots));
    }

    remove(index: number): Shots {
        this.shots.splice(index, 1);
        return this;
    }

    add(shot: Shot): Shots {
        this.shots.push(shot);
        return this;
    }

    length(): number {
        return this.shots.length;
    }

    move(oldIndex: number, newIndex: number) : Shots {
         if (newIndex >= this.shots.length) {
           let k = newIndex - this.shots.length + 1;
           while (k--) {
             // @ts-ignore
               this.shots.push(undefined);
           }
         }
         this.shots.splice(newIndex, 0, this.shots.splice(oldIndex, 1)[0]);
         return this;
    }
}

// status
export interface Axis {
    isAtPosition: boolean;
    isMoving: boolean;
    position: number;
    speed: number;
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
    ROBOT_STATE: 'robotState',
}
