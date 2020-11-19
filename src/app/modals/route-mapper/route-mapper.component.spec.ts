import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteMapperComponent } from './route-mapper.component';

describe('RouteMapperComponent', () => {
  let component: RouteMapperComponent;
  let fixture: ComponentFixture<RouteMapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteMapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
