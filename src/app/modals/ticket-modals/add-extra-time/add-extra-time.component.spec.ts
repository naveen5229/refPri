import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExtraTimeComponent } from './add-extra-time.component';

describe('AddExtraTimeComponent', () => {
  let component: AddExtraTimeComponent;
  let fixture: ComponentFixture<AddExtraTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExtraTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExtraTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
