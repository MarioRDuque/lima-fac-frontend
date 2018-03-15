import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDatepickerConfig, NgbDateStruct, NgbDropdownConfig, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import {I18n, CustomDatepickerI18n} from './../../servicios/datepicker-i18n';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-venta-lista',
  templateUrl: './venta-lista.component.html',
  styleUrls: ['./venta-lista.component.css'],
  providers: [I18n, NgbDatepickerConfig, NgbDropdownConfig, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}]
})
export class VentaListaComponent implements OnInit {

  public languaje = 'es';
  public ventas: any = [];
  public page: number = 1;
  public paginacion:Paginacion;
  public desde:NgbDateStruct;
  public hasta:NgbDateStruct;
  public nombrec:string;
  public dnic:string;
  public solicitando = false;
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public parametros: any = {};

  constructor(
    private router: Router,
    private apiRequest: ApiRequestService,
    private auth: AuthService
  ) {
    this.paginacion = new Paginacion();
  }

  ngOnInit() {
    this.traerVentas();
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "desde": new Date(this.desde ? this.desde.year+'/'+this.desde.month+'/'+this.desde.day : ""),
      "hasta": new Date(this.hasta ? this.hasta.year+'/'+this.hasta.month+'/'+this.hasta.day : ""),
      "dni":this.dnic,
      "nombre":this.nombrec
    };
    this.traerVentas();
  }

  traerVentas(parametros:any=this.parametros): void {
    this.parametros.tipoUsuario=this.auth.getTipoUser();
    this.parametros.usuario=this.auth.getUserName();
    this.solicitando = true;
    this.apiRequest.post('venta/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, this.parametros)
      .then(data => {
        if(data !== undefined){
          this.solicitando = false;
          this.solicitudExitosa = true;
          this.paginacion.totalRegistros = data.totalRegistros;
          this.paginacion.paginaActual = data.paginaActual;
          this.paginacion.totalPaginas = data.totalPaginas;
          this.ventas = data.registros;
        }
      })
      .catch(err => this.handleError(err));
  }

  nuevoVenta(){
    this.router.navigate(["./ventas/formulario"]);
  }

  private handleError(error: any): void {
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }


}
