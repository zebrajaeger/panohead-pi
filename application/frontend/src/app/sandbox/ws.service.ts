import {Injectable} from '@angular/core';
import {Client} from 'rpc-websockets';
import {ClientValue} from '@zebrajaeger/ws-value';
import {FOV, Overlap, PanoFOV, Shots, Status, Timing, wsNames} from './wsInterface';
import * as store from 'store2';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private isConnected: boolean;
  private readonly client: Client;

  readonly host: string;

  readonly timing: ClientValue<Timing>;
  readonly shots: ClientValue<Shots>;
  readonly status: ClientValue<Status>;
  readonly jogging: ClientValue<boolean>;
  readonly panoFov: ClientValue<PanoFOV>;
  readonly imageFov: ClientValue<FOV>;
  readonly overlap: ClientValue<Overlap>;

  constructor() {
    this.host = store.get('ph.host');
    let h = 'ws://' + this.host;
    console.log('connect to', h)
    this.client = new Client(h, {max_reconnects: 0, reconnect_interval: 2500});
    this.client.on('open', () => {
      console.log('OPEN')
      this.isConnected = true;
      this.sendConnectionChange();
    })
    this.client.on('close', () => {
      console.log('CLOSE')
      this.isConnected = false;
      this.sendConnectionChange();
    })
    this.timing = new ClientValue<Timing>(this.client, wsNames.TIMING);
    this.shots = new ClientValue<Shots>(this.client, wsNames.SHOTS);
    this.status = new ClientValue<Status>(this.client, wsNames.STATUS);
    this.jogging = new ClientValue<boolean>(this.client, wsNames.JOGGING);
    this.panoFov = new ClientValue<PanoFOV>(this.client, wsNames.PANO_FOV);
    this.imageFov = new ClientValue<FOV>(this.client, wsNames.IMAGE_FOV);
    this.overlap = new ClientValue<Overlap>(this.client, wsNames.OVERLAP);
  }

  setHost(host: string, reload: boolean) {
    store.set('ph.host', host);
    if (reload) {
      window.location.reload();
    }
  }

  onConnected(l: ((connected: boolean) => void)) {
    this.connectionListeners.push(l);
    l(this.isConnected);
  }

  sendConnectionChange() {
    this.connectionListeners.forEach(l => l(this.isConnected))
  }

  joystickCalibrateAsTopLeft() {
    return this.client.call('joystickCalibrateAsTopLeft');
  }

  joystickCalibrateAsCenter() {
    return this.client.call('joystickCalibrateAsCenter');
  }

  joystickCalibrateAsBottomRight() {
    return this.client.call('joystickCalibrateAsBottomRight');
  }

  joystickSetBacklash(backlashX: number, backlashY: number) {
    return this.client.call('joystickSetBacklash', {
      x1: backlashX,
      x2: backlashX,
      y1: backlashY,
      y2: backlashY
    });
  }

  cameraStartFocus(durationMs: number) {
    return this.client.call('cameraStartFocus', {durationMs});
  }

  cameraStartTrigger(durationMs: number) {
    return this.client.call('cameraStartTrigger', {durationMs});
  }

  cameraStartShot(focusMs: number, triggerMs: number) {
    return this.client.call('cameraStartShot', {focusMs, triggerMs});
  }
}
