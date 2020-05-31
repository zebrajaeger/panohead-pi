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

const TIMING = 'timing';
const SHOTS = 'shots';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  private readonly client: Client;

  public timing: ClientValue<Timing>;
  public shots: ClientValue<Shot[]>;

  private isInitialized = false;
  private initializerCallbacks: (() => void)[] = [];

  constructor() {
    this.client = new Client('ws://localhost:8081');
    this.client.on('open', () => {
      this.timing = new ClientValue<Timing>(this.client, TIMING);
      this.shots = new ClientValue<Shot[]>(this.client, SHOTS);
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
