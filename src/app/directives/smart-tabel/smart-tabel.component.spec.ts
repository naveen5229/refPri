import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTabelComponent } from './smart-tabel.component';

describe('SmartTabelComponent', () => {
  let component: SmartTabelComponent;
  let fixture: ComponentFixture<SmartTabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartTabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
