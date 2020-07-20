import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AxestrackMappingComponent } from './axestrack-mapping.component';

describe('AxestrackMappingComponent', () => {
  let component: AxestrackMappingComponent;
  let fixture: ComponentFixture<AxestrackMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AxestrackMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AxestrackMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
