import {Injectable} from '@angular/core';
import {Client} from 'rpc-websockets';
import {ClientValue} from '@zebrajaeger/ws-value';

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

export interface Status {
  actor: Actor;
  joystick: Joystick;
}

const TIMING = 'timing';
const SHOTS = 'shots';
const STATUS = 'status';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  private readonly client: Client;

  public timing: ClientValue<Timing>;
  public shots: ClientValue<Shot[]>;
  public status: ClientValue<Status>;

  private isInitialized = false;
  private initializerCallbacks: (() => void)[] = [];

  constructor() {
    this.client = new Client('ws://192.168.178.68:8081');
    this.client.on('open', () => {
      this.timing = new ClientValue<Timing>(this.client, TIMING);
      this.shots = new ClientValue<Shot[]>(this.client, SHOTS);
      this.status = new ClientValue<Status>(this.client, STATUS);
      this.sendInitialized();
    });
  }

  protected sendInitialized() {
    this.isInitialized = true;
    this.initializerCallbacks.forEach(initializerCallback => {
      initializerCallback();
    });
  }

  onInitialized(cb: () => void): void {
    if (this.isInitialized) {
      cb();
    } else {
      this.initializerCallbacks.push(cb);
    }
  }
}
