import { Component, OnInit, ViewChild, NgZone, ElementRef, NgModule} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Injectable} from '@angular/core';
import { I18n, CustomDatepickerI18n} from './../../servicios/datepicker-i18n';
import { ConfirmacionComponent } from './../../util/confirmacion/confirmacion.component';
import { ClienteComponent } from './../../cliente/cliente.component';
import { ProductoComponent } from './../../producto/producto.component';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { Venta } from '../../entidades/entidad.venta';
import { Ventadet } from '../../entidades/entidad.ventadet';

const NOW = new Date();

@Component({
  selector: 'app-venta-formulario',
  templateUrl: './venta-formulario.component.html',
  styleUrls: ['./venta-formulario.component.css']
})
export class VentaFormularioComponent implements OnInit {

  public paginacion:Paginacion;
  venta : Venta;
  tipoDocs : any = [];
  tiposMon : any = [];
  public page: number = 1;
  tiposOperacion = [
    {
      id:'03',
      nombre:"BOLETA"
    },
    {
      id:'01',
      nombre:"FACTURA"
    },
    {
      id:'07',
      nombre:"NOTA DE CREDITO"
    },
    {
      id:'08',
      nombre:"NOTA DE CARGO"
    },
    {
      id:'00',
      nombre:"NOTA DE PEDIDO"
    }
  ];
  importe: number = 0;
  public idPedido : number;
  public esEdicion:boolean = false;
  public solicitando:boolean = false;
  public cargando:boolean = false;
  public solicitudExitosa = false;
  public mensajeForUser : string = "";
  public productos : any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private api: ApiRequestService,
    private modalService: NgbModal,
    public auth: AuthService
  ) {
    this.paginacion = new Paginacion();
    this.venta = new Venta();
  }

  ngOnInit() {
    this.venta.tipooperacion = this.tiposOperacion[0].id;
    this.cargando = true;
    this.traerTipoDocs();
    this.traerTiposMon();
    this.route.params.subscribe(params => {
      if(params['id']!=null) {
        this.idPedido = +params['id'];
        this.esEdicion = true;
        this.traerVenta();
      } else {
        this.cargando = false;
      }
    });
  };

  abrirClientes():void{
    const modalRef = this.modalService.open(ClienteComponent, { size: 'lg', keyboard: false});
    modalRef.componentInstance.isModal = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      this.venta.nombrecliente = reason && reason.idpersona ? reason.idpersona.nombrecompleto : "";
    });
  };

  traerTipoDocs(){
    let tipoDocs = JSON.parse(localStorage.getItem("tiposDocumento"));
    if(tipoDocs && tipoDocs.length>0){
      this.tipoDocs = tipoDocs;
      this.venta.idtipodocumento = this.tipoDocs[0];
    } else {
      return this.api.post('tipodocumento/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, {})
        .then(
          data => {
            if(data){
              this.tipoDocs = data.registros;
              this.venta.idtipodocumento = this.tipoDocs[0];
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  traerTiposMon(){
    let tiposMon = JSON.parse(localStorage.getItem("tiposMoneda"));
    if(tiposMon && tiposMon.length>0){
      this.tiposMon = tiposMon;
      this.venta.idmoneda = this.tiposMon[0];
    } else {
      return this.api.get('moneda')
        .then(
          data => {
            if(data && data.extraInfo){
              this.tiposMon = data.extraInfo;
              this.venta.idmoneda = this.tiposMon[0];
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  confirmarEliminacionDetalle(o):void{
    const modalRef = this.modalService.open(ConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarDetalle(o);
    }, (reason) => {
    });
  }

  eliminarDetalle(o){
    if(o.id){
      this.solicitando = true;
      this.api.get('venta/eliminardetalle/'+o.id)
        .then(data => {
          if(data.extraInfo){
            this.toastr.success(data.operacionMensaje, 'Exito');
            this.venta.ventadetList.splice(this.venta.ventadetList.indexOf(o),1);
          } else {
            this.toastr.error(data.operacionMensaje, 'Error');
          }
          this.solicitando = false;
          this.solicitudExitosa = true;
          this.calcularImporte();
        })
        .catch(err => this.handleError(err));
    } else {
      this.venta.ventadetList.splice(this.venta.ventadetList.indexOf(o),1);
      this.calcularImporte();
    }
  }

  abrirProductos():void{
    const modalRef = this.modalService.open(ProductoComponent, { size: 'lg', keyboard: false});
    modalRef.componentInstance.isModalProducto = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      if(reason && reason.id){
        let detalle = new Ventadet();
        detalle.idproducto = reason;
        detalle.idventa = this.venta.id;
        detalle.idunidadmedida = reason && reason.productomedidaList[0] ? reason.productomedidaList[0].idunidadmedida : {};
        detalle.preciounitario = reason.productomedidaList[0].precio>0?reason.productomedidaList[0].precio:0;
        detalle.preciototal = 1 * reason.productomedidaList[0].precio>0?reason.productomedidaList[0].precio:0;
        this.venta.ventadetList.push(detalle);
        this.operaciones(detalle);
      }
    });
  }

  obtenerPrecio(detalle){
    let producto = detalle.idproducto;
    let pm = producto.productomedidaList;
    let unidad = detalle.idunidadmedida;
    let pmSelect = pm.find(item => item.idunidadmedida.id === unidad.id);
    detalle.preciounitario = pmSelect.precio;
    this.operaciones(detalle);
  };

  traerVenta(id:number=this.idPedido,ruta:string='/venta/obtenerEntidad'): void {
    this.solicitando = true;
    this.api.post(ruta,{"id":id})
      .then(data => {
        if(data.extraInfo){
          this.venta = data.extraInfo;
          this.calcularImporte();
          this.llenarDatosParaEdicion(this.venta);
        } else {
          this.toastr.error(data.operacionMensaje, 'Error');
          this.router.navigate(['./venta/lista/'+id]);
        }
        this.solicitando = false;
        this.solicitudExitosa = true;
      })
      .catch(err => this.handleError(err));
  };

  guardarVenta(ventaParam: any){
    ventaParam.usuariosave = this.auth.getUserName();
    this.api.post("venta",ventaParam)
      .then(respuesta => {
        if(respuesta && respuesta.extraInfo){
          this.solicitudExitosa = true;
          this.toastr.success(respuesta.operacionMensaje, 'Exito');
          this.limpiarCampos();
          this.router.navigate(['./ventas/lista/']);
        }else{
          this.solicitudExitosa = false;
          this.toastr.error(respuesta.operacionMensaje, 'Error');
        }
      })
      .catch(err => this.handleError(err));
  };

  editarVenta(ventaParam: Venta){
    ventaParam.fechaemision = new Date(ventaParam.fechaemision);
    ventaParam.fechaemision.setDate(ventaParam.fechaemision.getDate()+1);
    ventaParam.usuarioupdate = this.auth.getUserName();
    this.api.put("venta",ventaParam)
      .then(respuesta => {
        if(respuesta !== undefined){
          if(respuesta && respuesta.extraInfo){
            this.solicitudExitosa = true;
            this.toastr.success(respuesta.operacionMensaje, 'Exito');
            this.router.navigate(['./ventas/lista']);
          }else{
            this.solicitudExitosa = false;
            this.toastr.error(respuesta.operacionMensaje, 'Error');
          }
        }
      })
      .catch(err => this.handleError(err));
  };

  nuevoVenta(){
    this.router.navigate(["./venta/formulario"]);
  };

  operaciones(detalle){
    if(detalle.descuentounitario>detalle.preciounitario){
      detalle.descuentounitario = detalle.preciounitario;
    }
    detalle.descuentototal = detalle.descuentounitario * detalle.cantidad;
    detalle.preciototal = (detalle.preciounitario * detalle.cantidad) - detalle.descuentototal;
    this.calcularImporte();
  };

  private handleError(error: any): void {
    this.solicitando = false;
    this.cargando = false;
    this.solicitudExitosa = false;
    this.toastr.error("Error Interno", 'Error');
  };

  calcularImporte() {
    this.importe = 0;
    for(var i=0; i<this.venta.ventadetList.length; i++){
      this.importe = this.venta.ventadetList[i].preciototal + this.importe;
    }
    this.importe;
  };

  onSubmit(): void {
    this.mensajeForUser = 'Guardando ...';
    this.esEdicion ? this.editarVenta(this.venta) : this.guardarVenta(this.venta);
  };

  llenarDatosParaEdicion(venta: Venta) : void {
    let tipoMon= venta.idmoneda;
    let tipomonedaselect = this.tiposMon.find(item => item.id == tipoMon.id);
    venta.idmoneda = tipomonedaselect;
    let tipoDoc= venta.idtipodocumento;
    let tipodocselect = this.tipoDocs.find(item => item.id == tipoDoc.id);
    venta.idtipodocumento = tipodocselect;
    if(venta.ventadetList){
      for(var i=0; i<venta.ventadetList.length; i++){
        if(venta.ventadetList[i].idproducto && venta.ventadetList[i].idproducto.productomedidaList){
          let pmul = venta.ventadetList[i].idproducto.productomedidaList.find(item => item.idunidadmedida.id === this.venta.ventadetList[i].idunidadmedida.id);
          this.venta.ventadetList[i].idunidadmedida = pmul.idunidadmedida;
        }
      }
    }
    this.cargando = false;
  };

  private limpiarCampos(){
    this.venta = new Venta();
  };

}
