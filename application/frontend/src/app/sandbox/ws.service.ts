import {Injectable} from '@angular/core';
import {Client} from 'rpc-websockets';
import {ClientValue} from '@zebrajaeger/ws-value';
import {FOV, Overlap, PanoFOV, Shot, Status, Timing, wsNames} from './wsInterface';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  private connectionListeners: ((connected: boolean) => void)[] = [];
  private isConnected: boolean;
  private readonly client: Client;

  public readonly timing: ClientValue<Timing>;
  public readonly shots: ClientValue<Shot[]>;
  public readonly status: ClientValue<Status>;
  public readonly jogging: ClientValue<boolean>;
  public readonly panoFov: ClientValue<PanoFOV>;
  public readonly imageFov: ClientValue<FOV>;
  public readonly overlap: ClientValue<Overlap>;

  constructor() {
    this.client = new Client('ws://192.168.178.69:8081', {max_reconnects: 0, reconnect_interval: 2500});
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
    this.shots = new ClientValue<Shot[]>(this.client, wsNames.SHOTS);
    this.status = new ClientValue<Status>(this.client, wsNames.STATUS);
    this.jogging = new ClientValue<boolean>(this.client, wsNames.JOGGING);
    this.panoFov = new ClientValue<PanoFOV>(this.client, wsNames.PANO_FOV);
    this.imageFov = new ClientValue<FOV>(this.client, wsNames.IMAGE_FOV);
    this.overlap = new ClientValue<Overlap>(this.client, wsNames.OVERLAP);
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
