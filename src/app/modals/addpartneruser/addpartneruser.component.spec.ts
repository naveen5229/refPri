import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpartneruserComponent } from './addpartneruser.component';

describe('AddpartneruserComponent', () => {
  let component: AddpartneruserComponent;
  let fixture: ComponentFixture<AddpartneruserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddpartneruserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpartneruserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
