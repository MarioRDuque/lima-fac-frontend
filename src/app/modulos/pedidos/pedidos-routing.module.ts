import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PedidosComponent } from './pedidos.component';
import { PedidoSeguimientoComponent } from './pedido-seguimiento/pedido-seguimiento.component';
import { FormularioPedidoComponent } from './formulario-pedido.component';
import { ListaPedidosComponent } from './lista-pedidos.component';

const pedidosRoutes: Routes = <Routes>[
  {
    path: '',
    component: PedidosComponent,
    children: [
      {
        path: '',
        children: [
          {path: 'lista', component: ListaPedidosComponent},
          {path: 'formulario', component: FormularioPedidoComponent},
          {path: 'formulario/:id', component: FormularioPedidoComponent},
          {path: 'seguimiento/:id', component: PedidoSeguimientoComponent},
          {path: '', redirectTo: 'lista', pathMatch: 'full'},
          {path: '**', component: ListaPedidosComponent}
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(pedidosRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class HomeRoutingModule { }
