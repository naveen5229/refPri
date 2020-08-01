import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanykycComponent } from './companykyc.component';

describe('CompanykycComponent', () => {
  let component: CompanykycComponent;
  let fixture: ComponentFixture<CompanykycComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanykycComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanykycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
