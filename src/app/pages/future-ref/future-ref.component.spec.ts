import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureRefComponent } from './future-ref.component';

describe('FutureRefComponent', () => {
  let component: FutureRefComponent;
  let fixture: ComponentFixture<FutureRefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureRefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureRefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
