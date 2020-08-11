import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowInstallerComponent } from './show-installer.component';

describe('ShowInstallerComponent', () => {
  let component: ShowInstallerComponent;
  let fixture: ComponentFixture<ShowInstallerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowInstallerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowInstallerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
