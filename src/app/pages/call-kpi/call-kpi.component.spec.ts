import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallKpiComponent } from './call-kpi.component';

describe('CallKpiComponent', () => {
  let component: CallKpiComponent;
  let fixture: ComponentFixture<CallKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
