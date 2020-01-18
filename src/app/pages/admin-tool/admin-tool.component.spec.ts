import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminToolComponent } from './admin-tool.component';

describe('AdminToolComponent', () => {
  let component: AdminToolComponent;
  let fixture: ComponentFixture<AdminToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
