import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalisedDashboardComponent } from './personalised-dashboard.component';

describe('PersonalisedDashboardComponent', () => {
  let component: PersonalisedDashboardComponent;
  let fixture: ComponentFixture<PersonalisedDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalisedDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalisedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
