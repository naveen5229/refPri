import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WwToolsComponent } from './ww-tools.component';

describe('WwToolsComponent', () => {
  let component: WwToolsComponent;
  let fixture: ComponentFixture<WwToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WwToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WwToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
