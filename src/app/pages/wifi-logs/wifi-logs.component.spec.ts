import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WifiLogsComponent } from './wifi-logs.component';

describe('WifiLogsComponent', () => {
  let component: WifiLogsComponent;
  let fixture: ComponentFixture<WifiLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WifiLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WifiLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
