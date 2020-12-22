import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProcessActionComponent } from './state-action-mapping';

describe('AddProcessActionComponent', () => {
  let component: AddProcessActionComponent;
  let fixture: ComponentFixture<AddProcessActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProcessActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProcessActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
