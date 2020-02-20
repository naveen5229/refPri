import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignInstallerToFieldrequestComponent } from './assign-installer-to-fieldrequest.component';

describe('AssignInstallerToFieldrequestComponent', () => {
  let component: AssignInstallerToFieldrequestComponent;
  let fixture: ComponentFixture<AssignInstallerToFieldrequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignInstallerToFieldrequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignInstallerToFieldrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
