import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-compra-lista',
  templateUrl: './compra-lista.component.html',
  styleUrls: ['./compra-lista.component.css']
})
export class CompraListaComponent implements OnInit {

  public languaje = 'es';
  public compras: any = [];
  public page: number = 1;
  public paginacion: Paginacion;
  public desde: NgbDateStruct;
  public hasta: NgbDateStruct;
  public nombrec: string;
  public dnic: string;
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
    this.page = 1;
    this.dnic = "";
    this.nombrec = "";
    this.parametros = {};
    this.traerCompras();
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "desde": new Date(this.desde ? this.desde.year + '/' + this.desde.month + '/' + this.desde.day : ""),
      "hasta": new Date(this.hasta ? this.hasta.year + '/' + this.hasta.month + '/' + this.hasta.day : ""),
      "dni": this.dnic,
      "nombre": this.nombrec
    };
    this.traerCompras();
  }

  traerCompras(parametros: any = this.parametros): void {
    this.parametros.tipoUsuario = this.auth.getTipoUser();
    this.parametros.usuario = this.auth.getUserName();
    this.solicitando = true;
    this.apiRequest.post('compra/pagina/' + this.page + '/cantidadPorPagina/' + this.paginacion.cantidadPorPagina, this.parametros)
      .then(data => {
        if (data !== undefined) {
          this.solicitando = false;
          this.solicitudExitosa = true;
          this.paginacion.totalRegistros = data.totalRegistros;
          this.paginacion.paginaActual = data.paginaActual;
          this.paginacion.totalPaginas = data.totalPaginas;
          this.compras = data.registros;
        }
      })
      .catch(err => this.handleError(err));
  }

  nuevoCompra() {
    this.router.navigate(["./compras/formulario"]);
  }

  private handleError(error: any): void {
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }

}
