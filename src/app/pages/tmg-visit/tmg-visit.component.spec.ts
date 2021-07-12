import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TmgVisitComponent } from './tmg-visit.component';

describe('TmgVisitComponent', () => {
  let component: TmgVisitComponent;
  let fixture: ComponentFixture<TmgVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TmgVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TmgVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
