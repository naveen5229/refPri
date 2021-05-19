import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionalReportingMappingComponent } from './functional-reporting-mapping.component';

describe('FunctionalReportingMappingComponent', () => {
  let component: FunctionalReportingMappingComponent;
  let fixture: ComponentFixture<FunctionalReportingMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionalReportingMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionalReportingMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
