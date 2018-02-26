import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EleccionComponent } from './eleccion.component';

describe('EleccionComponent', () => {
  let component: EleccionComponent;
  let fixture: ComponentFixture<EleccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EleccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EleccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
