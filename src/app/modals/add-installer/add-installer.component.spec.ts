import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInstallerComponent } from './add-installer.component';

describe('AddInstallerComponent', () => {
  let component: AddInstallerComponent;
  let fixture: ComponentFixture<AddInstallerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddInstallerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInstallerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
