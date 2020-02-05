import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketCallRatingComponent } from './ticket-call-rating.component';

describe('TicketCallRatingComponent', () => {
  let component: TicketCallRatingComponent;
  let fixture: ComponentFixture<TicketCallRatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketCallRatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketCallRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
