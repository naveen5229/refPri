import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddentityfieldsComponent } from './addentityfields.component';

describe('AddentityfieldsComponent', () => {
  let component: AddentityfieldsComponent;
  let fixture: ComponentFixture<AddentityfieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddentityfieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddentityfieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
