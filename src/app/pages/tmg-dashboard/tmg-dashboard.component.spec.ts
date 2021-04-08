import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TmgDashboardComponent } from './tmg-dashboard.component';

describe('TmgDashboardComponent', () => {
  let component: TmgDashboardComponent;
  let fixture: ComponentFixture<TmgDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TmgDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TmgDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
