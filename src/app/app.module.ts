import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NguiMapModule } from '@ngui/map';
import { SourceCodeService } from './source-code.service';
import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { UiSwitchModule } from 'ngx-ui-switch';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRouterModule } from './app-routing.module';
import { ComponentesModule } from './componentes/componentes.module';
import { PedidosModule } from './modulos/pedidos/pedidos.module';

import { AuthService } from './servicios/auth.service';
import { ApiRequestService } from './servicios/api-request.service';
import { ReportService } from './servicios/report.service';
import { GenericoService } from './servicios/generico.service';
import { HomeService } from './servicios/home.service';
import { environment } from '../environments/environment';

import { AppComponent, ModalLogin } from './app.component';

import { AppConfig } from './app-config';
import { WelcomeComponent } from './componentes/welcome.component';
import { EleccionComponent } from './componentes/eleccion/eleccion.component';
import { MantenimientoComponent } from './componentes/mantenimiento/mantenimiento.component';
import { ReporteComponent } from './componentes/reporte/reporte.component';
import { ClienteComponent } from './componentes/cliente/cliente.component';
import { AppNoMenuComponent } from './componentes/app-no-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalLogin,
    WelcomeComponent,
    EleccionComponent,
    MantenimientoComponent,
    ReporteComponent,
    AppNoMenuComponent
  ],
  entryComponents: [
    ModalLogin,
  ],
  imports: [
    NgbModule.forRoot(),
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    BrowserModule,
    AppRouterModule,
    ComponentesModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    PedidosModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NguiMapModule.forRoot({
      apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyCbMGRUwcqKjlYX4h4-P6t-xcDryRYLmCM' +
      '&libraries=visualization,places,drawing',
    }),
    UiSwitchModule
  ],
  providers: [
    SourceCodeService,
    AppConfig,
    AuthService,
    ApiRequestService,
    ReportService,
    GenericoService,
    HomeService,
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
