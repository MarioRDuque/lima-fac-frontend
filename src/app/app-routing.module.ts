import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';

import { WelcomeComponent } from './componentes/welcome.component';
import { EleccionComponent } from './componentes/eleccion/eleccion.component';
import { AppNoMenuComponent } from './componentes/app-no-menu.component';
import { MantenimientoComponent } from './componentes/mantenimiento/mantenimiento.component';
import { ReporteComponent } from './componentes/reporte/reporte.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { ClienteComponent } from './componentes/cliente/cliente.component';
import { AppComponent } from './app.component';

const routes: Routes = [
	{ path: 'welcome', component: WelcomeComponent },
  { path: 'menu', component: EleccionComponent },
	{ path: 'pedidos', loadChildren: 'app/modulos/pedidos/pedidos.module#PedidosModule' },
	{ path: 'mantenimiento', component: MantenimientoComponent },
	{ path: 'reportes', component: ReporteComponent },
	{ path: 'clientes', component: ClienteComponent },
	{ path: 'productos', component: ProductosComponent },
	{ path: 'nomenu', component: AppNoMenuComponent },
	{ path: '', redirectTo: '/welcome', pathMatch: 'full' },
	{ path: '**', component: WelcomeComponent }
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes,
			{
        useHash : true
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
