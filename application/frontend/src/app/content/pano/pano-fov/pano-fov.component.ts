import {Component} from '@angular/core';
import {PanoFOV, Status} from '../../../sandbox/wsInterface';
import {MatDialog} from '@angular/material/dialog';
import {WsService} from '../../../sandbox/ws.service';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-pano-fov',
  templateUrl: './pano-fov.component.html',
  styleUrls: ['./pano-fov.component.scss']
})
export class PanoFovComponent {
  fov: PanoFOV;
  status: Status;

  constructor(private snackBar: MatSnackBar, public wsService: WsService) {
    this.clear();
    wsService.panoFov.onInit(fov => this.fov = fov);
    wsService.panoFov.onChange(fov => {
      this.fov = fov
      this.snackBar.open('FOV updated', null, {
        duration: 2000
      });

    });
    wsService.status.onInit(status => this.status = status);
    wsService.status.onChange(status => this.status = status);
  }

  save() {
    this.wsService.panoFov.setValue(this.fov);
  }

  updatePartial($event: MatSlideToggleChange) {
    this.fov.partial = $event.checked;
  }

  onTopClick() {
    this.fov.a.y = this.status.actor.y.position;
  }

  onBottomClick() {
    this.fov.b.y = this.status.actor.y.position;
  }

  onLeftClick() {
    if (this.fov.partial) {
      this.fov.a.x = this.status.actor.x.position;
    }
  }

  onRightClick() {
    if (this.fov.partial) {
      this.fov.b.x = this.status.actor.x.position;
    }
  }

  clear() {
    this.fov = {partial: false, a: {x: 0, y: 0}, b: {x: 0, y: 0}};
  }
}
