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
  imageFov: FOV;
  panoFov: PanoFOV;
  status: Status;
  robotState: string;

  constructor(private snackBar: MatSnackBar, public wsService: WsService) {
    wsService.status.onChange(s => this.status = s);

    wsService.pano.onInit(pano => this.setPano(pano));
    wsService.pano.onChange(pano => this.setPano(pano));

    wsService.imageFov.onInit(fov => this.setImageFov(fov));
    wsService.imageFov.onChange(fov => this.setImageFov(fov));

    wsService.panoFov.onInit(fov => this.setPanoFov(fov));
    wsService.panoFov.onChange(fov => this.setPanoFov(fov));

    wsService.robotState.onInit(robotState => this.robotState = robotState);
    wsService.robotState.onChange(robotState => this.robotState = robotState);
  }

  private setPano(pano: Pano) {
    this.pano = pano;
    this.snackBar.open('Pano updated', null, {
      duration: 2000
    });
  }

  private setImageFov(fov: FOV) {
    this.imageFov = fov;
    this.snackBar.open('ImageFOV updated', null, {
      duration: 2000
    });
  }

  private setPanoFov(fov: PanoFOV) {
    this.panoFov = fov;
    this.snackBar.open('panoFov updated', null, {
      duration: 2000
    });
  }

  start() {
    this.wsService.panoStart();
  }

  stop() {
    this.wsService.panoStop();
  }

  pauseResume() {
    this.wsService.panoPauseResume();
  }
}
