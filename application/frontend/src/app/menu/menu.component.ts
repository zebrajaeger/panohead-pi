import {Component, OnInit} from '@angular/core';
import {WsService} from '../sandbox/ws.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  connected: boolean;

  constructor(private wsService: WsService) {
    wsService.onConnected(connected => this.connected = connected);
  }

  ngOnInit(): void {
  }

}
