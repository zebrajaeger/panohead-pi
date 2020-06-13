import {Component, OnInit} from '@angular/core';
import {WsService} from '../../../sandbox/ws.service';
import {NavigationEnd, Router} from '@angular/router';
import {Status} from '../../../sandbox/wsInterface';

@Component({
  selector: 'app-joystick',
  templateUrl: './joystick.component.html',
  styleUrls: ['./joystick.component.scss']
})
export class JoystickComponent {
  public status: Status;
  public backlashX: number = 2;
  public backlashY: number = 2;

  constructor(public wsService: WsService) {
    wsService.status.onChange(s => this.status = s);
  }

  downX() {
    if(this.backlashX>0){
      this.backlashX--;
    }
  }

  upX() {
    if(this.backlashX<100){
      this.backlashX++;
    }
  }

  downY() {
    if(this.backlashY>0){
      this.backlashY--;
    }

  }

  upY() {
    if(this.backlashY<100){
      this.backlashY++;
    }
  }

  save() {
    this.wsService.joystickSetBacklash(this.backlashX, this.backlashY);
  }
}
