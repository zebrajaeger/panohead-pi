import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {WsService} from '../../../sandbox/ws.service';
import {FOV, Pano, PanoFOV, Status} from '../../../sandbox/wsInterface';

@Component({
  selector: 'app-pano-robot',
  templateUrl: './pano-robot.component.html',
  styleUrls: ['./pano-robot.component.scss']
})
export class PanoRobotComponent {
  pano: Pano;
  private imageFov: FOV;
  private panoFov: PanoFOV;
  public status: Status;

  constructor(private snackBar: MatSnackBar, public wsService: WsService) {
    wsService.status.onChange(s => this.status = s);

    wsService.pano.onInit(pano => {
      this.pano = pano;
      this.snackBar.open('Pano updated', null, {
        duration: 2000
      });
    });
    wsService.pano.onChange(pano => {
      this.pano = pano;
      this.snackBar.open('Pano updated', null, {
        duration: 2000
      });
    });

    wsService.imageFov.onInit(fov => {
      this.imageFov = fov;
      this.snackBar.open('ImageFOV updated', null, {
        duration: 2000
      });
    });
    wsService.imageFov.onChange(fov => {
      this.imageFov = fov;
      this.snackBar.open('ImageFOV updated', null, {
        duration: 2000
      });
    });

    wsService.panoFov.onInit(fov => {
      this.panoFov = fov;
      this.snackBar.open('panoFov updated', null, {
        duration: 2000
      });
    });
    wsService.panoFov.onChange(fov => {
      this.panoFov = fov;
      this.snackBar.open('panoFov updated', null, {
        duration: 2000
      });
    });

  }
}
