import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDatepickerConfig, NgbDateStruct, NgbDropdownConfig, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import {I18n, CustomDatepickerI18n} from './../../servicios/datepicker-i18n';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { PedidosService } from './servicios/pedidos.service';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.css'],
  providers: [I18n, NgbDatepickerConfig, NgbDropdownConfig, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}]
})
export class ListaPedidosComponent implements OnInit {

  public languaje = 'es';
  public pedidos: any = [];
  public centrob: string;
  public page: number = 1;
  public paginacion:Paginacion;
  public desde:NgbDateStruct;
  public hasta:NgbDateStruct;
  public nombrec:string;
  public dnic:string;
  public centros: any = [];
  public solicitando = false;
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public parametros: any = {};

  constructor(
    private router: Router,
    private pedidosService: PedidosService,
    private apiRequest: ApiRequestService,
    private auth: AuthService
  ) {
    this.paginacion = new Paginacion();
  }

  ngOnInit() {
    this.traerPedidos();
    let centros = JSON.parse(localStorage.getItem("centros"));
    centros ? this.centros = centros : this.traerUbigeos('centro',1);
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "desde": new Date(this.desde ? this.desde.year+'/'+this.desde.month+'/'+this.desde.day : ""),
      "hasta": new Date(this.hasta ? this.hasta.year+'/'+this.hasta.month+'/'+this.hasta.day : ""),
      "dni":this.dnic,
      "nombre":this.nombrec,
      "idubigeo":this.centrob
    };
    this.traerPedidos();
  }

  traerUbigeos(nombre, padre) {
    let centros = JSON.parse(localStorage.getItem("centros"));
    if(centros){
      this.centros = centros;
    }
    return this.apiRequest.post('ubigeo/listar', {padre:padre})
      .then(
        data => {
          if(data && data.extraInfo){
            this.centros = data.extraInfo;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  traerPedidos(parametros:any=this.parametros): void {
    this.parametros.tipoUsuario=this.auth.getTipoUser();
    this.parametros.usuario=this.auth.getUserName();
    this.solicitando = true;
    this.pedidosService.getLista(this.page, this.paginacion.cantidadPorPagina, parametros)
      .then(data => {
        if(data !== undefined){
          this.solicitando = false;
          this.solicitudExitosa = true;
          this.paginacion.totalRegistros = data.totalRegistros;
          this.paginacion.paginaActual = data.paginaActual;
          this.paginacion.totalPaginas = data.totalPaginas;
          this.pedidos = data.registros;
        }
      })
      .catch(err => this.usarStorage(err));
  }

  nuevoPedido(){
     this.router.navigate(["./pedidos/formulario"]);
  }

  private handleError(error: any): void {
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }

  usarStorage(err){
    if(err.status == 0 || err.status == 504){
      this.solicitando = false;
      this.pedidos = JSON.parse(localStorage.getItem("pedidos"))
    } else {
      this.handleError(err);
    }
  }

}
