import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddfouserComponent } from './addfouser.component';

describe('AddfouserComponent', () => {
  let component: AddfouserComponent;
  let fixture: ComponentFixture<AddfouserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddfouserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddfouserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
