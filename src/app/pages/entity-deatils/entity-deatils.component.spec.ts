import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDeatilsComponent } from './entity-deatils.component';

describe('EntityDeatilsComponent', () => {
  let component: EntityDeatilsComponent;
  let fixture: ComponentFixture<EntityDeatilsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityDeatilsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDeatilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
