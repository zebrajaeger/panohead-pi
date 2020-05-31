import {Component} from '@angular/core';
import {NumberDialogComponent} from '../../ui/number-dialog/number-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {WsService} from '../../sandbox/ws.service';

@Component({
  selector: 'app-motion',
  templateUrl: './motion.component.html',
  styleUrls: ['./motion.component.scss']
})
export class MotionComponent {
  // delayAfterMove = 0;
  // delayBetweenShots = 0;
  // delayAfterLastShot = 0;

  constructor(private dialog: MatDialog, public wsService: WsService) {
  }

  editDelayAfterMove() {
    this.edit(this.wsService.timing.getValue().delayAfterMove).then(value => {
      const timing = this.wsService.timing.getValue();
      timing.delayAfterMove = value;
      this.wsService.timing.setValue(timing);
    });
  }

  editDelayBetweenShots() {
    this.edit(this.wsService.timing.getValue().delayBetweenShots).then(value => {
      const timing = this.wsService.timing.getValue();
      timing.delayBetweenShots = value;
      this.wsService.timing.setValue(timing);
    });
  }

  editDelayAfterLastShot() {
    this.edit(this.wsService.timing.getValue().delayAfterLastShot).then(value => {
      const timing = this.wsService.timing.getValue();
      timing.delayAfterLastShot = value;
      this.wsService.timing.setValue(timing);
    });
  }

  edit(value: number): Promise<number> {
    return new Promise<number>(resolve => {
      const dialogRef = this.dialog.open(NumberDialogComponent, {
        width: '250px',
        data: value
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!isNaN(result)) {
          resolve(result);
        }
      });
    });
  }
}
