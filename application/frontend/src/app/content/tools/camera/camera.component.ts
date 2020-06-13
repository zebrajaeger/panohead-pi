import {Component, OnInit} from '@angular/core';
import {WsService} from '../../../sandbox/ws.service';
import {Status} from '../../../sandbox/wsInterface';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent {
   status: Status;
  constructor(public wsService: WsService) {
    wsService.status.onChange( value => this.status = value)
  }

  focus(durationMs: number) {
    this.wsService.cameraStartFocus(durationMs);
  }

  trigger(durationMs: number) {
    this.wsService.cameraStartTrigger(durationMs);
  }

  shot(focusMs: number, triggerMs: number) {
    this.wsService.cameraStartShot(focusMs, triggerMs);
  }
}
