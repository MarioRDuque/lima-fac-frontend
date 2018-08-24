import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleImeisComponent } from './detalle-imeis.component';

describe('DetalleImeisComponent', () => {
  let component: DetalleImeisComponent;
  let fixture: ComponentFixture<DetalleImeisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleImeisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleImeisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
