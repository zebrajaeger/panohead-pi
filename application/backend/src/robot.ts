import {Pano, Shot, Timing} from './wsInterface';
import {Optional} from 'typescript-optional';

export enum State {
    INITIALIZED,
    MOVING,
    WAITING_BEFORE_SHOT,
    SHOOTING,
    WAITING_BETWEEN_SHOTS,
    WAITING_AFTER_LAST_SHOT,
    FINISHED
}

class Position {
    private readonly xMax_: number;
    private readonly yMax_: number;
    private readonly x_: number;
    private readonly y_: number;

    constructor(xMax: number, yMax: number, x: number, y: number) {
        this.xMax_ = xMax;
        this.yMax_ = yMax;
        this.x_ = x || 0;
        this.y_ = y || 0;
    }

    get x(): number {
        return this.x_;
    }

    get y(): number {
        return this.y_;
    }

    hasNextPos(): boolean {
        return this.x_ + 1 < this.xMax_ && this.y_ + 1 < this.yMax_;
    }

    nextPos(): Optional<Position> {
        let xx = this.x_ + 1;
        let yy = this.y_;

        if (xx >= this.xMax_) {
            xx = 0;
            yy++;
        }

        if (yy >= this.yMax_) {
            return Optional.empty();
        } else {
            return Optional.of(new Position(this.xMax_, this.yMax_, xx, yy));
        }
    }
}

export class Robot {
    private state: State = State.INITIALIZED;
    private pano: Optional<Pano> = Optional.empty();
    private position: Optional<Position> = Optional.empty();
    private timing: Optional<Timing> = Optional.empty();
    private shots: Optional<Shot[]> = Optional.empty();
    private shotIndex: number = 0;
    private stateListeners: ((newState: State, oldState: State) => void)[] = [];
    private moveToListeners: ((x: number, y: number) => void)[] = [];
    private stopListeners: (() => void)[] = [];
    private shotListeners: ((focusMs: number, triggerMs: number) => void)[] = [];

    onStop(cb: () => void) {
        this.stopListeners.push(cb);
    }

    onMoveTo(cb: (x: number, y: number) => void) {
        this.moveToListeners.push(cb);
    }

    onShot(cb: (focusMs: number, triggerMs: number) => void) {
        this.shotListeners.push(cb);
    }

    onStateChanged(cb: (newState: State, oldState: State) => void) {
        this.stateListeners.push(cb);
    }

    start(pano: Pano, timing: Timing, shots: Shot[]) {
        if (this.state === State.INITIALIZED || this.state === State.FINISHED) {
            this.pano = Optional.of(pano);
            this.timing = Optional.of(timing);
            this.shots = Optional.of(shots);
            if (this.pano.isPresent() && this.timing.isPresent() && this.shots.isPresent()) {
                this.shotIndex = 0;
                this.resetPos();
                this.setState(State.MOVING);
                this.moveToPos();
            }
        }
    }

    pauseResume() {
        // TODO
    }

    stop() {
        this.stopListeners.forEach(cb => cb());
        this.setState(State.FINISHED);
    }

    triggerPositionReached() {
        if (this.state === State.MOVING) {
            this.setState(State.WAITING_BEFORE_SHOT);
            this.startTimer(this.timing.get().delayAfterMove);
        }
    }

    triggerShotDone() {
        if (this.state === State.SHOOTING) {
            if (this.hasNextShot()) {
                this.setState(State.WAITING_BETWEEN_SHOTS);
                this.startTimer(this.timing.get().delayBetweenShots);
            } else {
                this.setState(State.WAITING_AFTER_LAST_SHOT);
                this.startTimer(this.timing.get().delayAfterLastShot);
            }
        }
    }

    private setState(newState: State): State {
        let previousState = this.state;
        this.state = newState;
        this.stateListeners.forEach(cb => cb(newState, previousState))
        return previousState;
    }

    private resetPos() {
        if (this.pano.isPresent()) {
            this.position = Optional.of(new Position(this.pano.get().x.length, this.pano.get().y.length, 0, 0));
        }
    }

    private hasNextPos(): boolean {
        return this.position.isPresent() && this.position.get().hasNextPos();
    }

    private incrementPos() {
        if (this.position.isPresent()) {
            this.position = this.position.get().nextPos();
        }
    }

    private moveToPos(): void {
        let x = this.pano.get().x[this.position.get().x];
        let y = this.pano.get().y[this.position.get().y];
        this.moveToListeners.forEach(cb => cb(x, y));
    }

    private resetShot() {
        this.shotIndex = 0;
    }

    private hasNextShot(): boolean {
        return this.shotIndex < this.shots.get().length;
    }

    private nextShot(): Optional<Shot> {
        if (this.hasNextShot()) {
            return Optional.of(this.shots.get()[this.shotIndex++]);
        } else {
            return Optional.empty();
        }
    }

    private takeShot() {
        let s = this.nextShot();
        if (s.isPresent()) {
            this.setState(State.SHOOTING);
            this.shotListeners.forEach(cb => cb(s.get().focusTime, s.get().triggerTime));
        } else {
            this.setState(State.WAITING_AFTER_LAST_SHOT);
            this.startTimer(this.timing.get().delayAfterLastShot)
        }
    }

    private onTimer() {
        if (this.state === State.WAITING_BEFORE_SHOT) {
            this.resetShot();
            this.takeShot();
        } else if (this.state === State.WAITING_BETWEEN_SHOTS) {
            this.takeShot();
        } else if (this.state === State.WAITING_AFTER_LAST_SHOT) {
            if (this.hasNextPos()) {
                this.incrementPos();
                this.setState(State.MOVING);
                this.moveToPos();
            } else {
                this.setState(State.FINISHED);
            }
        }
    }

    private startTimer(ms: number) {
        setTimeout(this.onTimer, ms);
    }
}