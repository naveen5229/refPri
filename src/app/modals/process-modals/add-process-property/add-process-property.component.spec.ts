import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProcessPropertyComponent } from './add-process-property.component';

describe('AddProcessPropertyComponent', () => {
  let component: AddProcessPropertyComponent;
  let fixture: ComponentFixture<AddProcessPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProcessPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProcessPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
