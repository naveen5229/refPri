import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWiseExpensesComponent } from './user-wise-expenses.component';

describe('UserWiseExpensesComponent', () => {
  let component: UserWiseExpensesComponent;
  let fixture: ComponentFixture<UserWiseExpensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserWiseExpensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserWiseExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
