import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionStateComponent } from './add-transaction-state.component';

describe('AddTransactionStateComponent', () => {
  let component: AddTransactionStateComponent;
  let fixture: ComponentFixture<AddTransactionStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTransactionStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransactionStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
