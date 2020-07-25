import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignFieldsComponent } from './assign-fields.component';

describe('AssignFieldsComponent', () => {
  let component: AssignFieldsComponent;
  let fixture: ComponentFixture<AssignFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
