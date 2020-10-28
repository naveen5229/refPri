import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketProcessComponent } from './ticket-process.component';

describe('TicketProcessComponent', () => {
  let component: TicketProcessComponent;
  let fixture: ComponentFixture<TicketProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
