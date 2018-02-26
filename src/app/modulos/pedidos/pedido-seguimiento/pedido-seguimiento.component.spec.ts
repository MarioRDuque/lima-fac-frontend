import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoSeguimientoComponent } from './pedido-seguimiento.component.ts';

describe('PedidoSeguimientoComponent', () => {
  let component: PedidoSeguimientoComponent;
  let fixture: ComponentFixture<PedidoSeguimientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoSeguimientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
