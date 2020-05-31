import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export class SpinnerValue {
  value: number;
  exponent: number;
  constructor(value: number, exponent: number) {
    this.value = value;
    this.exponent = exponent;
  }
}

@Component({
  selector: 'app-digit-spinner',
  templateUrl: './digit-spinner.component.html',
  styleUrls: ['./digit-spinner.component.scss']
})
export class DigitSpinnerComponent implements OnInit {

  @Input()
  @Output()
  value = 0;

  @Input() exponent = 0;

  @Output()
  digitChange = new EventEmitter<SpinnerValue>();

  constructor() {
  }

  emitChanged() {
    this.digitChange.emit(new SpinnerValue(this.value, this.exponent));
  }

  ngOnInit(): void {
    // this.emitChanged();
  }

  onPlus() {
    this.value++;
    if (this.value > 9) {
      this.value = 0;
    }
    this.emitChanged();
  }

  onMinus() {
    this.value--;
    if (this.value < 0) {
      this.value = 9;
    }
    this.emitChanged();
  }

  onReset() {
    if (this.value !== 0) {
      this.value = 0;
      this.emitChanged();
    }
  }
}
