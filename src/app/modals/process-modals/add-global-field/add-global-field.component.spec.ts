import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGlobalFieldComponent } from './add-global-field.component';

describe('AddGlobalFieldComponent', () => {
  let component: AddGlobalFieldComponent;
  let fixture: ComponentFixture<AddGlobalFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGlobalFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGlobalFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
