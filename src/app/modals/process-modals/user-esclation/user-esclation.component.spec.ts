import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEsclationComponent } from './user-esclation.component';

describe('UserEsclationComponent', () => {
  let component: UserEsclationComponent;
  let fixture: ComponentFixture<UserEsclationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEsclationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEsclationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
