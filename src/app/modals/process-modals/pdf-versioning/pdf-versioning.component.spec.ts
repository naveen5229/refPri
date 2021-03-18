import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfVersioningComponent } from './pdf-versioning.component';

describe('PdfVersioningComponent', () => {
  let component: PdfVersioningComponent;
  let fixture: ComponentFixture<PdfVersioningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfVersioningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfVersioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
