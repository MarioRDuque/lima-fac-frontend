import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';
import { ConfirmacionComponent } from '../../util/confirmacion/confirmacion.component';

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
    private auth: AuthService,
    private modalService: NgbModal,
    private toastr: ToastrService
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

  confirmarEliminacion(compra): void {
    const modalRef = this.modalService.open(ConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminar(compra);
    }, (reason) => {
    });
  }

  eliminar(compra) {
    this.solicitando = true;
    return this.apiRequest.post('compra/eliminar', { id: compra.id })
      .then(
        data => {
          if (data && data.extraInfo) {
            this.compras.splice(this.compras.indexOf(compra), 1);
            this.toastr.success(data.operacionMensaje, "Exito");
          } else {
            this.toastr.warning(data.operacionMensaje, "Informacion");
          }
          this.solicitando = false;
        }
      )
      .catch(err => this.handleError(err));
  }

}
