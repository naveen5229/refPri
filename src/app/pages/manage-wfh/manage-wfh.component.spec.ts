import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWFHComponent } from './manage-wfh.component';

describe('ManageWFHComponent', () => {
  let component: ManageWFHComponent;
  let fixture: ComponentFixture<ManageWFHComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageWFHComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageWFHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
