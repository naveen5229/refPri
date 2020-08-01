import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportbulkvehicleComponent } from './importbulkvehicle.component';

describe('ImportbulkvehicleComponent', () => {
  let component: ImportbulkvehicleComponent;
  let fixture: ComponentFixture<ImportbulkvehicleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportbulkvehicleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportbulkvehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
