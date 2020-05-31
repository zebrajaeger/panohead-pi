import { Injectable } from '@angular/core';
import {NumberDialogComponent} from './number-dialog/number-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor(public dialog: MatDialog) {
  }

  editNumber(value: number): Promise<number> {
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
