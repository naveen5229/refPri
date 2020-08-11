import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionActionComponent } from './add-transaction-action.component';

describe('AddTransactionActionComponent', () => {
  let component: AddTransactionActionComponent;
  let fixture: ComponentFixture<AddTransactionActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTransactionActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransactionActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
