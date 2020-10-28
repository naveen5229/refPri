import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFieldTableComponent } from './add-field-table.component';

describe('AddFieldTableComponent', () => {
  let component: AddFieldTableComponent;
  let fixture: ComponentFixture<AddFieldTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFieldTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFieldTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
