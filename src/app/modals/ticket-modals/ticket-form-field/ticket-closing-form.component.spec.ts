import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketClosingFormComponent } from './ticket-closing-form.component';

describe('TicketClosingFormComponent', () => {
  let component: TicketClosingFormComponent;
  let fixture: ComponentFixture<TicketClosingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketClosingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketClosingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
