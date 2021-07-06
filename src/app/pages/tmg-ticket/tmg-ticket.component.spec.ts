import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TmgTicketComponent } from './tmg-ticket.component';

describe('TmgTicketComponent', () => {
  let component: TmgTicketComponent;
  let fixture: ComponentFixture<TmgTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TmgTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TmgTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
