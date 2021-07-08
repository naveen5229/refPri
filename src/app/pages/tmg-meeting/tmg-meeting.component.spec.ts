import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TmgMeetingComponent } from './tmg-meeting.component';

describe('TmgMeetingComponent', () => {
  let component: TmgMeetingComponent;
  let fixture: ComponentFixture<TmgMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TmgMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TmgMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
