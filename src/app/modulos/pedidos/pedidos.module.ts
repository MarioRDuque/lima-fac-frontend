import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NguiMapModule } from '@ngui/map';

import { ComponentesModule } from '../../componentes/componentes.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PedidosService } from './servicios/pedidos.service';

import { ApiRequestService } from '../../servicios/api-request.service';
import { GenericoService } from '../../servicios/generico.service';

import { HomeRoutingModule } from './pedidos-routing.module';
import { PedidosComponent } from './pedidos.component';

import { PedidoSeguimientoComponent } from './pedido-seguimiento/pedido-seguimiento.component';
import { FormularioPedidoComponent } from './formulario-pedido.component';
import { ListaPedidosComponent } from './lista-pedidos.component';
import{ ModalConfirmacionComponent } from '../../componentes/modal-confirmacion.component';
import{ ClienteComponent } from '../../componentes/cliente/cliente.component';
import{ ProductosComponent } from '../../componentes/productos/productos.component';
import{ RevisionesComponent } from '../../componentes/revisiones.component';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    ComponentesModule,
    NguiMapModule
  ],
  providers: [
    PedidosService,
    ApiRequestService,
    GenericoService
  ],
  entryComponents: [
    ModalConfirmacionComponent,
    RevisionesComponent,
    ClienteComponent,
    ProductosComponent
  ],
  declarations: [
    PedidosComponent,
    PedidoSeguimientoComponent,
    FormularioPedidoComponent,
    ListaPedidosComponent,
    ModalConfirmacionComponent,
    RevisionesComponent,
    ClienteComponent,
    ProductosComponent
  ]
})
export class PedidosModule { }
