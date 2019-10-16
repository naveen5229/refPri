import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfEmployeeComponent } from './list-of-employee.component';

describe('ListOfEmployeeComponent', () => {
  let component: ListOfEmployeeComponent;
  let fixture: ComponentFixture<ListOfEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListOfEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOfEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
