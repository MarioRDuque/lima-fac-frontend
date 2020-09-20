import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';
import { AuthGuardService } from './servicios/auth-guard.service';

import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { PedidoComponent } from './pedido/pedido.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { ClienteComponent } from './cliente/cliente.component';
import { ReporteComponent } from './reporte/reporte.component';
import { ProductoComponent } from './producto/producto.component';
import { VentaComponent } from './venta/venta.component';
import { PedidoListaComponent } from './pedido/pedido-lista/pedido-lista.component';
import { PedidoFormularioComponent } from './pedido/pedido-formulario/pedido-formulario.component';
import { PedidoSeguimientoComponent } from './pedido/pedido-seguimiento/pedido-seguimiento.component';
import { VentaListaComponent } from './venta/venta-lista/venta-lista.component';
import { ReportesVentaComponent } from './venta/reportes-venta/reportes-venta.component';
import { VentaFormularioComponent } from './venta/venta-formulario/venta-formulario.component';
import { ProveedorComponent } from './proveedor/proveedor.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: WelcomeComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: 'mantenimiento', component: MantenimientoComponent },
      { path: 'clientes', component: ClienteComponent },
      {
        path: 'pedidos', component: PedidoComponent,
        children: [
          { path: 'lista', component: PedidoListaComponent },
          { path: 'formulario', component: PedidoFormularioComponent },
          { path: 'formulario/:id', component: PedidoFormularioComponent },
          { path: 'seguimiento/:id', component: PedidoSeguimientoComponent },
          { path: '', redirectTo: 'lista', pathMatch: 'full' }
        ]
      },
      { path: 'reportes', component: ReporteComponent },
      { path: 'productos', component: ProductoComponent },
      { path: 'proveedor', component: ProveedorComponent },
      {
        path: 'ventas', component: VentaComponent,
        children: [
          { path: 'lista', component: VentaListaComponent },
          { path: 'repventas', component: ReportesVentaComponent },
          { path: 'formulario', component: VentaFormularioComponent },
          { path: 'formulario/:id', component: VentaFormularioComponent },
          { path: '', redirectTo: 'lista', pathMatch: 'full' }
        ]
      },
      {
        path: 'compras', component: VentaComponent,
        children: [
          { path: 'lista', component: VentaListaComponent },
          { path: 'repcompras', component: ReportesVentaComponent },
          { path: 'formulario', component: VentaFormularioComponent },
          { path: 'formulario/:id', component: VentaFormularioComponent },
          { path: '', redirectTo: 'lista', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '*', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        useHash: true
      }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SelectivePreloadingStrategy,
  ]
})
export class AppRouterModule { }
