import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanoRobotComponent } from './pano-robot.component';

describe('PanoRobotComponent', () => {
  let component: PanoRobotComponent;
  let fixture: ComponentFixture<PanoRobotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanoRobotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanoRobotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
