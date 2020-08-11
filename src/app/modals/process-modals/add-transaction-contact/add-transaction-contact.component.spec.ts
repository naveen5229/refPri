import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionContactComponent } from './add-transaction-contact.component';

describe('AddTransactionContactComponent', () => {
  let component: AddTransactionContactComponent;
  let fixture: ComponentFixture<AddTransactionContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTransactionContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransactionContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
