import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxGenericTemplateComponent } from './ngx-generic-template.component';

describe('NgxGenericTemplateComponent', () => {
  let component: NgxGenericTemplateComponent;
  let fixture: ComponentFixture<NgxGenericTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxGenericTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxGenericTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
