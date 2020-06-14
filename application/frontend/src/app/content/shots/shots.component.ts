import {Component} from '@angular/core';
import {UiService} from '../../ui/ui.service';
import {WsService} from '../../sandbox/ws.service';
import {Shot, Shots} from '../../sandbox/wsInterface';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-shots',
  templateUrl: './shots.component.html',
  styleUrls: ['./shots.component.scss']
})
export class ShotsComponent {

  displayedColumns: string[] = ['focusTime', 'triggerTime', 'moveUp', 'moveDown', 'remove'];
  shots: Shots;

  constructor(private snackBar: MatSnackBar, private uiService: UiService, public wsService: WsService) {
    wsService.shots.onChange(shots => {
      this.shots = new Shots(shots.shots); // we need a complete object
      console.log('newShots', JSON.stringify(shots))
      this.snackBar.open('Shots updated', null, {
        duration: 2000
      });
    });
  }

  editCell(shot: Shot, column: string) {
    console.log('EDITCELL', shot, column, shot[column])
    this.uiService.editNumber(shot[column]).then(value => shot[column] = value);
  }

  isNotLastRow(i: number) {
    if (this.shots) {
      return (this.shots.length() - 1) > i
    } else {
      return true;
    }
  }

  moveUp(i: number) {
    this.move(i, i - 1);
  }

  moveDown(i: number) {
    this.move(i, i + 1);
  }

  move(oldIndex: number, newIndex: number) {
    this.wsService.shots.setValue(this.shots.copy().move(oldIndex,newIndex));
  }

  remove(index: number) {
    this.wsService.shots.setValue(this.shots.copy().remove(index));
  }

  add() {
    this.wsService.shots.setValue(this.shots.copy().add({focusTime: 0.0, triggerTime: 1.0}));
  }
}
