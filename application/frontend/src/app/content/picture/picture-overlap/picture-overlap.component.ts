import {Component} from '@angular/core';
import {UiService} from '../../../ui/ui.service';

@Component({
  selector: 'app-picture-overlap',
  templateUrl: './picture-overlap.component.html',
  styleUrls: ['./picture-overlap.component.scss']
})
export class PictureOverlapComponent {
  overlapX = 30.3;
  overlapY = 30.3;

  constructor(private uiService: UiService) {
  }

  editOverlapX() {
    this.uiService.editNumber(this.overlapX).then(value => this.overlapX = value);
  }

  editOverlapY() {
    this.uiService.editNumber(this.overlapY).then(value => this.overlapY = value);
  }
}
