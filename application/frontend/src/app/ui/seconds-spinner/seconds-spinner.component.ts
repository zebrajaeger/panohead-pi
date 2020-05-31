import {AfterViewInit, Component, EventEmitter, Input, Output, QueryList, ViewChildren} from '@angular/core';
import {DigitSpinnerComponent, SpinnerValue} from '../digit-spinner/digit-spinner.component';


@Component({
  selector: 'app-seconds-spinner',
  templateUrl: './seconds-spinner.component.html',
  styleUrls: ['./seconds-spinner.component.scss']
})
export class SecondsSpinnerComponent implements AfterViewInit {

  initialized = false;
  @ViewChildren(DigitSpinnerComponent) spinners: QueryList<DigitSpinnerComponent>;

  @Input() unit: string;
  @Input() decimals = 2;
  @Input() fractions = 2;
  @Output() valueChange = new EventEmitter<number>();

  valueInternal: number;

  @Input('value')
  set value(value: number) {
    this.valueInternal = value;
    if (this.initialized) {
      this.valueChange.emit(this.readValue());
    }
  }

  constructor() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.writeValue(this.valueInternal), 0);
    this.initialized = true;
  }

  onDigitChange(spinnerValue: SpinnerValue) {
    this.valueChange.emit(this.readValue());
  }

  readValue(): number {
    let x = 0;
    this.spinners.forEach((spinner) => {
      x += Math.pow(10, spinner.exponent) * spinner.value;
    });
    return x;
  }

  writeValue(n: number) {
    const sN = n.toString();
    const parts = sN.split('.');
    const d = parts[0].split('').map(Number).reverse();
    let f = [];
    if (parts.length === 2) {
      f = parts[1].split('').map(Number);
    }
    this.spinners.forEach((spinner) => {
      const e = spinner.exponent;
      const e2 = -e - 1;
      if (e >= 0 && d.length > e) {
        spinner.value = d[e];
      }
      if (e2 >= 0 && f.length > e2) {
        spinner.value = f[e2];
      }
    });
  }
}
