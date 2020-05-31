import {Component, OnInit} from '@angular/core';
import {WsService, Status} from '../../../sandbox/ws.service';

@Component({
  selector: 'app-joystick',
  templateUrl: './joystick.component.html',
  styleUrls: ['./joystick.component.scss']
})
export class JoystickComponent {
  private status: Status;

  constructor(private wsService: WsService) {
    wsService.onInitialized(()=>{
      wsService.status.onChange(s => this.status = s);
    })
  }
}
