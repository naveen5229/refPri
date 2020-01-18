import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveadminComponent } from './saveadmin.component';

describe('SaveadminComponent', () => {
  let component: SaveadminComponent;
  let fixture: ComponentFixture<SaveadminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveadminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
