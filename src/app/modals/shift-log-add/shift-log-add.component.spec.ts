import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftLogAddComponent } from './shift-log-add.component';

describe('ShiftLogAddComponent', () => {
  let component: ShiftLogAddComponent;
  let fixture: ComponentFixture<ShiftLogAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftLogAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftLogAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
