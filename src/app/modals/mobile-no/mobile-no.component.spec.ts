import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNoComponent } from './mobile-no.component';

describe('MobileNoComponent', () => {
  let component: MobileNoComponent;
  let fixture: ComponentFixture<MobileNoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileNoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
