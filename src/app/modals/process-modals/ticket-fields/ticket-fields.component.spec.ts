import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketFieldsComponent } from './ticket-fields.component';

describe('TicketFieldsComponent', () => {
  let component: TicketFieldsComponent;
  let fixture: ComponentFixture<TicketFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
