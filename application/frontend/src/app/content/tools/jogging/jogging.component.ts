import {Component, OnInit} from '@angular/core';
import {Status} from '../../../sandbox/wsInterface';
import {WsService} from '../../../sandbox/ws.service';

@Component({
  selector: 'app-jogging',
  templateUrl: './jogging.component.html',
  styleUrls: ['./jogging.component.scss']
})
export class JoggingComponent {
  public status: Status;

  constructor(public wsService: WsService) {
    wsService.status.onChange(s => this.status = s);
  }
}
