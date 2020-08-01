import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketCallMappingComponent } from './ticket-call-mapping.component';

describe('TicketCallMappingComponent', () => {
  let component: TicketCallMappingComponent;
  let fixture: ComponentFixture<TicketCallMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketCallMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketCallMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
