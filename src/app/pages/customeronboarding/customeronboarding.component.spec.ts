import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomeronboardingComponent } from './customeronboarding.component';

describe('CustomeronboardingComponent', () => {
  let component: CustomeronboardingComponent;
  let fixture: ComponentFixture<CustomeronboardingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomeronboardingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomeronboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
