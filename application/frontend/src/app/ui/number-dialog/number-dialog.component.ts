import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-number-dialog',
  templateUrl: './number-dialog.component.html',
  styleUrls: ['./number-dialog.component.scss']
})
export class NumberDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NumberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
