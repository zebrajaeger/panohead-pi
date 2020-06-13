import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {WsService} from '../../../sandbox/ws.service';
import {FOV, Status} from '../../../sandbox/wsInterface';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Component({
  selector: 'app-fov',
  templateUrl: './fov.component.html',
  styleUrls: ['./fov.component.scss']
})
export class FovComponent {
  fov: FOV;
  status: Status;

  constructor(private snackBar: MatSnackBar, public wsService: WsService) {
    this.clear();
    wsService.imageFov.onInit(fov => this.fov = fov);
    wsService.imageFov.onChange(fov => {
      this.fov = fov;
      this.snackBar.open('FOV updated', null, {
        duration: 2000
      });
    });
    wsService.status.onInit(status => this.status = status);
    wsService.status.onChange(status => this.status = status);
  }

  save() {
    this.wsService.imageFov.setValue(this.fov);
  }

  onTopClick() {
    this.fov.a.y = this.status.actor.y.position;
  }

  onBottomClick() {
    this.fov.b.y = this.status.actor.y.position;
  }

  onLeftClick() {
    this.fov.a.x = this.status.actor.x.position;
  }

  onRightClick() {
    this.fov.b.x = this.status.actor.x.position;
  }

  clear() {
    this.fov = {a: {x: 0, y: 0}, b: {x: 0, y: 0}};
  }
}
