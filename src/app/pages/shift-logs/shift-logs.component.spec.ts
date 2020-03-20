import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftLogsComponent } from './shift-logs.component';

describe('ShiftLogsComponent', () => {
  let component: ShiftLogsComponent;
  let fixture: ComponentFixture<ShiftLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
