import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStacksComponent } from './add-stacks.component';

describe('AddStacksComponent', () => {
  let component: AddStacksComponent;
  let fixture: ComponentFixture<AddStacksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStacksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
