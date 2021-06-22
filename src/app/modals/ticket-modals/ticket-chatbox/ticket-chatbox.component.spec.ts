import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketChatboxComponent } from './ticket-chatbox.component';

describe('ChatboxComponent', () => {
  let component: TicketChatboxComponent;
  let fixture: ComponentFixture<TicketChatboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TicketChatboxComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketChatboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
