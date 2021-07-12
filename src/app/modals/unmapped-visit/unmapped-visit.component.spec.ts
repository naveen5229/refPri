import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnmappedVisitComponent } from './unmapped-visit.component';

describe('UnmappedVisitComponent', () => {
  let component: UnmappedVisitComponent;
  let fixture: ComponentFixture<UnmappedVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnmappedVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnmappedVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
