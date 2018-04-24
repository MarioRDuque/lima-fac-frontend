import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRouterModule } from './app-routing.module';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NguiMapModule } from '@ngui/map';
import { SourceCodeService } from './source-code.service';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { ClienteComponent } from './cliente/cliente.component';
import { PedidoComponent } from './pedido/pedido.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';
import { ReporteComponent } from './reporte/reporte.component';

import {InputMaskModule} from 'primeng/inputmask';
import {KeyFilterModule} from 'primeng/keyfilter';
import {AutoCompleteModule} from 'primeng/autocomplete';

import { AuthService } from './servicios/auth.service';
import { ApiRequestService } from './servicios/api-request.service';
import { ReportService } from './servicios/report.service';
import { GenericoService } from './servicios/generico.service';
import { HomeService } from './servicios/home.service';
import { AuthGuardService } from './servicios/auth-guard.service';
import { environment } from '../environments/environment';
import { AppConfig } from './app-config';
import { ProductoComponent } from './producto/producto.component';
import { CargandoComponent } from './util/cargando/cargando.component';
import { ConfirmacionComponent } from './util/confirmacion/confirmacion.component';
import { PedidoListaComponent } from './pedido/pedido-lista/pedido-lista.component';
import { PedidoFormularioComponent } from './pedido/pedido-formulario/pedido-formulario.component';
import { PedidoSeguimientoComponent } from './pedido/pedido-seguimiento/pedido-seguimiento.component';
import { VentaComponent } from './venta/venta.component';
import { FacturacionComponent } from './facturacion/facturacion.component';
import { VentaListaComponent } from './venta/venta-lista/venta-lista.component';
import { VentaFormularioComponent } from './venta/venta-formulario/venta-formulario.component';
import { ReportesVentaComponent } from './venta/reportes-venta/reportes-venta.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    ClienteComponent,
    PedidoComponent,
    MantenimientoComponent,
    ReporteComponent,
    ProductoComponent,
    CargandoComponent,
    ConfirmacionComponent,
    PedidoListaComponent,
    PedidoFormularioComponent,
    PedidoSeguimientoComponent,
    VentaComponent,
    FacturacionComponent,
    VentaListaComponent,
    VentaFormularioComponent,
    ReportesVentaComponent
  ],
  imports: [
    NgbModule.forRoot(),
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    BrowserModule,
    AppRouterModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NguiMapModule.forRoot({
      apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyCbMGRUwcqKjlYX4h4-P6t-xcDryRYLmCM' +
      '&libraries=visualization,places,drawing',
    }),
    UiSwitchModule,
    InputMaskModule,
    KeyFilterModule,
    AutoCompleteModule
  ],
  entryComponents: [
    ConfirmacionComponent
  ],
  providers: [
    SourceCodeService,
    AppConfig,
    AuthService,
    ApiRequestService,
    ReportService,
    GenericoService,
    HomeService,
    AuthGuardService,
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
