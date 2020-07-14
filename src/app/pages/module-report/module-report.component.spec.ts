import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleReportComponent } from './module-report.component';

describe('ModuleReportComponent', () => {
  let component: ModuleReportComponent;
  let fixture: ComponentFixture<ModuleReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModuleReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
