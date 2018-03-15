import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoListaComponent } from './pedido-lista.component';

describe('PedidoListaComponent', () => {
  let component: PedidoListaComponent;
  let fixture: ComponentFixture<PedidoListaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoListaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
