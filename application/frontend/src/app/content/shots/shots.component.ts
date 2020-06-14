import {Component} from '@angular/core';
import {UiService} from '../../ui/ui.service';
import { WsService} from '../../sandbox/ws.service';
import {Shot} from '../../sandbox/wsInterface';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-shots',
  templateUrl: './shots.component.html',
  styleUrls: ['./shots.component.scss']
})
export class ShotsComponent {

  displayedColumns: string[] = ['focusTimeS', 'triggerTimeS', 'moveUp', 'moveDown', 'remove'];
  shots: Shot[];

  constructor(private snackBar: MatSnackBar,private uiService: UiService, public wsService: WsService) {
      wsService.shots.onChange(shots => {
        this.shots = shots;
        console.log('newShots',JSON.stringify(shots))
        this.snackBar.open('Shots updated' + JSON.stringify(shots), null, {
          duration: 2000
        });
      });
  }

  editCell(shot: Shot, column: string) {
    this.uiService.editNumber(shot[column]).then(value => shot[column] = value);
  }

  isNotLastRow(i: number) {
    return this.wsService.shots.getValue().length - 1 > i;
  }

  moveUp(i: number) {
    this.move(i, i - 1);
  }

  moveDown(i: number) {
    this.move(i, i + 1);
  }

  move(oldIndex: number, newIndex: number) {
    // const shotsCopy = [].concat(shots);
    // if (newIndex >= shots.length) {
    //   let k = newIndex - shots.length + 1;
    //   while (k--) {
    //     shots.push(undefined);
    //   }
    // }
    // shots.splice(newIndex, 0, shots.splice(oldIndex, 1)[0]);
    // this.wsService.shots.setValue([].concat(shots));
  }

  remove(index: number) {
    // const shots = this.wsService.shots.getValue();
    // shots.splice(index, 1);
    // this.wsService.shots.setValue([].concat(shots));
    const shotsCopy = [].concat(this.shots);
    shotsCopy.splice(index, 1);
    this.wsService.shots.setValue(shotsCopy);
  }

  add() {
    const shotsCopy = [].concat(this.shots);
    shotsCopy.push({focusTime: 0.0, triggerTime: 1.0});
    console.log('shotsCopy',JSON.stringify(shotsCopy))
    this.wsService.shots.setValue(shotsCopy);
  }
}
