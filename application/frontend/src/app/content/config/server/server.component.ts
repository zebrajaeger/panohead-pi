import {Component, OnInit} from '@angular/core';
import {WsService} from '../../../sandbox/ws.service';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent {

  host: string = "";

  constructor(private wsService: WsService) {
    this.host = wsService.host;;
  }

  onHost($event: Event) {
    // @ts-ignore
    this.host = $event.target.value;
  }

  reload() {
    this.wsService.setHost(this.host, true);
  }
}
