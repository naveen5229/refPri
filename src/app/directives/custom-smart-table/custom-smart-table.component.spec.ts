import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSmartTableComponent } from './custom-smart-table.component';

describe('CustomSmartTableComponent', () => {
  let component: CustomSmartTableComponent;
  let fixture: ComponentFixture<CustomSmartTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSmartTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSmartTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
