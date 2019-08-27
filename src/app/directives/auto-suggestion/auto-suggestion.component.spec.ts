import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoSuggestionComponent } from './auto-suggestion.component';

describe('AutoSuggestionComponent', () => {
  let component: AutoSuggestionComponent;
  let fixture: ComponentFixture<AutoSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoSuggestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
