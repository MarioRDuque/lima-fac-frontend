import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNoMenuComponent } from './app-no-menu.component';

describe('AppNoMenuComponent', () => {
  let component: AppNoMenuComponent;
  let fixture: ComponentFixture<AppNoMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppNoMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNoMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
