import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAdminComponent } from './process-admin.component';

describe('ProcessAdminComponent', () => {
  let component: ProcessAdminComponent;
  let fixture: ComponentFixture<ProcessAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
