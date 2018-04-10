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
import { ReportService } from '../../servicios/report.service';
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
  ventas : any = [];
  tipoDocs : any = [];
  tiposMon : any = [];
  igv:number=0;
  idventa:number;
  cliente:any={};
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
  public seriecorrelativo;
  public u_default:any;
  public clientes:any=[];
  public param:any={};
  @ViewChild("boletaDownload") boletaDownload;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private api: ApiRequestService,
    private apiReport: ReportService,
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
    this.traerIGV();
    this.traerUDefault();
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

  search(event) {
    this.traerClientes(event.query);

    /*this.mylookupservice.getResults(event.query).then(data => {
      this.results = data;
    });*/
  }

  traerClientes(query): any {
    this.param = {
      "docCliente":this.venta.doccliente
    };
    this.solicitando = true;
    return this.api.post('cliente/pagina/'+1+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, this.param)
      .then(
        data => {
          if(data){
            this.solicitando = false;
            this.clientes = data.registros;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  abrirClientes():void{
    const modalRef = this.modalService.open(ClienteComponent, { size: 'lg', keyboard: false});
    modalRef.componentInstance.isModal = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      this.venta.nombrecliente = reason && reason.idpersona ? reason.idpersona.nombrecompleto : "";
      this.venta.doccliente = reason && reason.idpersona ? reason.idpersona.numdocumento : "";
    });
  };

  buscarVenta(): void {
    this.cargando = true;
    this.api.post('venta/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, {seriecorrelativo:this.seriecorrelativo})
      .then(data => {
        if(data && data.registros){
          this.cargando = false;
          this.ventas = data.registros;
        } else {
          this.toastr.info("No se encontró documento.", "Aviso");
          this.cargando = false;
        }
      })
      .catch(err => this.handleError(err));
  }

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
    let tiposMon = JSON.parse(localStorage.getItem("monedas"));
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

  traerIGV(){
    this.cargando = true;
    let igv = JSON.parse(localStorage.getItem("igv"));
    if(igv){
      this.igv = igv.valor;
      this.cargando = false;
    } else {
      return this.api.get('parametro/igv')
        .then(
          data => {
            if(data && data.extraInfo){
              this.igv = data.extraInfo[0].valor;
            } else {
              this.toastr.error("No se encontró valor para el IGV, por favor recargar la página.", "Alerta");
            }
            this.cargando =false;
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  traerUDefault(){
    this.cargando = true;
    let unidad = JSON.parse(localStorage.getItem("unidaddefault"));
    if(unidad){
      this.u_default = unidad;
      this.cargando = false;
    } else {
      return this.api.get('unidad/default')
        .then(
          data => {
            if(data && data.extraInfo){
              this.u_default = data.extraInfo;
              localStorage.setItem("unidaddefault",JSON.stringify(this.u_default));
            } else {
              this.toastr.error("No se encontró unidad por defecto por favor recargar la página.", "Alerta");
            }
            this.cargando =false;
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
        if(!reason.productomedidaList[0]){
          let pm = {
            "estado":true,
            "precio":1,
            "idproducto":reason.id,
            "idunidadmedida":this.u_default
          };
          reason.productomedidaList.push(pm);
        }
        detalle.idunidadmedida = reason && reason.productomedidaList[0] ? reason.productomedidaList[0].idunidadmedida : {};
        detalle.preciounitario = reason.productomedidaList[0].precio>0?reason.productomedidaList[0].precio:0;
        detalle.preciototal = 1 * reason.productomedidaList[0].precio>0?reason.productomedidaList[0].precio:0;
        if(reason.afectoigv){
          detalle.afectacionigv = "10";
        }
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
      .catch(err => this.volverAlista(err));
  };

  validarDocumento(){
    return this.api.post('cliente/obtenerv', {dni:this.venta.doccliente})
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.venta.nombrecliente = data.extraInfo.nombre;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  generarNotaPedido(id){
    this.cargando = true;
    this.api.get("venta/notapedido/"+id+"/descripcion/"+this.venta.descripcion)
      .then(respuesta => {
        if(respuesta && respuesta.extraInfo){
          this.cargando = false;
          this.toastr.success(respuesta.operacionMensaje, 'Exito');
          this.router.navigate(['./ventas/lista/']);
        }else{
          this.cargando = false;
          this.toastr.error(respuesta.operacionMensaje, 'Error');
        }
      })
      .catch(err => this.handleError(err));
  }

  guardarVenta(ventaParam: any){
    this.cargando = true;
    ventaParam.usuariosave = this.auth.getUserName();
    if(ventaParam.tipooperacion == '03'){
      ventaParam.idtipodocumento = this.tipoDocs.find(item => item.id == 1);
    }
    if(ventaParam.tipooperacion == '01'){
      ventaParam.idtipodocumento = this.tipoDocs.find(item => item.id == 2);
    }
    this.api.post("venta",ventaParam)
      .then(respuesta => {
        if(respuesta && respuesta.extraInfo){
          this.idventa = respuesta.extraInfo;
          this.solicitudExitosa = true;
          this.toastr.success(respuesta.operacionMensaje, 'Exito');
          this.limpiarCampos();
          this.imprimirBoleta();
          this.cargando = false;
        }else{
          this.solicitudExitosa = false;
          this.toastr.error(respuesta.operacionMensaje, 'Error');
          this.cargando = false;
        }
      })
      .catch(err => this.handleError(err));
  };

  editarVenta(ventaParam: Venta){
    this.cargando = true;
    ventaParam.fechaemision = new Date(ventaParam.fechaemision);
    ventaParam.fechaemision.setDate(ventaParam.fechaemision.getDate()+1);
    ventaParam.usuarioupdate = this.auth.getUserName();
    this.api.put("venta",ventaParam)
      .then(respuesta => {
        if(respuesta !== undefined){
          if(respuesta && respuesta.extraInfo){
            this.idventa = respuesta.extraInfo;
            this.solicitudExitosa = true;
            this.toastr.success(respuesta.operacionMensaje, 'Exito');
            this.imprimirBoleta();
          }else{
            this.solicitudExitosa = false;
            this.toastr.error(respuesta.operacionMensaje, 'Error');
          }
          this.cargando = false;
        }
      })
      .catch(err => this.handleError(err));
  };

  imprimirBoleta(){
    this.cargando = true;
    let params={
      "codusu":this.auth.getUserName(),
      "report":'rptBoletaSunat',
      "idVenta":this.idventa
    };
    this.apiReport.post("reporte/generarsunat",params)
      .then(
        data => {
          if(data){
            this.descargarArchivoPDF('application/pdf','rptDetalleBoleta.pdf',data);
            this.cargando = false;
            this.router.navigate(['./ventas/lista/']);
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  descargarArchivoPDF(tipoDocumento,nombreArchivo,data){
    if(data){
      var fileName = nombreArchivo;
      var file = new Blob([data._body],{type: tipoDocumento });
      var url = URL.createObjectURL(file);
      this.boletaDownload.nativeElement.href = url;
      this.boletaDownload.nativeElement.target = "_blank";
      this.boletaDownload.nativeElement.click();
    }
  }

  nuevoVenta(){
    this.router.navigate(["./venta/formulario"]);
  };

  operacionesIGV(){
    if(this.venta && this.venta.ventadetList && this.venta.ventadetList.length>0){
      for(let i=0; i<this.venta.ventadetList.length; i++){
        this.operaciones(this.venta.ventadetList[i]);
      }
    }

  }

  operaciones(detalle){
    if(detalle.descuentounitario>detalle.preciounitario){
      detalle.descuentounitario = detalle.preciounitario;
    }
    detalle.descuentototal = detalle.descuentounitario * detalle.cantidad;
    if(detalle.afectacionigv == "20"){
      detalle.igvitem = 0;
      detalle.valorunitariosinigv = detalle.preciounitario;
    } else {
      detalle.igvitem = detalle.preciounitario * detalle.cantidad * this.igv;
      detalle.valorunitariosinigv = detalle.preciounitario - detalle.preciounitario*this.igv;
    }
    detalle.preciototal = (detalle.preciounitario * detalle.cantidad) - detalle.descuentototal;
    detalle.igvitem = Math.round( detalle.igvitem * 100 ) / 100;
    detalle.preciototalsinigv = (detalle.valorunitariosinigv*detalle.cantidad) - detalle.descuentototal;
    detalle.preciototalsinigv = Math.round( detalle.preciototalsinigv * 100 ) / 100;
    detalle.valorunitariosinigv = Math.round( detalle.valorunitariosinigv * 100 ) / 100;
    this.calcularImporte();
  };

  private handleError(error: any): void {
    this.solicitando = false;
    this.cargando = false;
    this.solicitudExitosa = false;
    this.toastr.error("Error Interno", 'Error');
  };

  private volverAlista(error: any): void {
    this.solicitando = false;
    this.cargando = false;
    this.solicitudExitosa = false;
    this.toastr.error("Error Interno", 'Error');
    this.router.navigate(["./ventas/lista"]);
  };

  calcularImporte() {
    this.importe = 0;
    this.venta.totaldesc = 0;
    this.venta.totalsinigv = 0;
    this.venta.valopeexo = 0;
    this.venta.igv = 0;
    for(var i=0; i<this.venta.ventadetList.length; i++){
      this.importe = this.venta.ventadetList[i].preciototal + this.importe;
      this.venta.totaldesc = this.venta.ventadetList[i].descuentototal + this.venta.totaldesc;
      if(this.venta.ventadetList[i].afectacionigv == "20"){
        this.venta.valopeexo = this.venta.valopeexo + this.venta.ventadetList[i].preciototal;
        this.venta.igv = this.venta.igv + this.venta.ventadetList[i].igvitem;
      } else {
        this.venta.totalsinigv = this.venta.ventadetList[i].preciototalsinigv + this.venta.totalsinigv;
        this.venta.igv = this.venta.igv + this.venta.ventadetList[i].igvitem;
      }
    }
    this.venta.importetotal = Math.round(this.importe*100)/100;
    this.venta.totaldesc = Math.round(this.venta.totaldesc*100)/100;
    /*this.venta.totalsinigv = this.importe - this.importe*this.igv;*/
    this.venta.igv = Math.round(this.venta.igv*100)/100;
    this.venta.totalsinigv = Math.round(this.venta.totalsinigv*100)/100;
    this.venta.valopeexo = Math.round(this.venta.valopeexo*100)/100;
  };

  onSubmit(): void {
    this.mensajeForUser = 'Guardando ...';
    if(this.validarCampos()){
      this.venta.importetotal = 0;
      this.venta.importetotal = this.venta.importetotal + this.venta.valopeexo;
      this.venta.importetotal = Math.round(this.venta.importetotal*100)/100;
      this.esEdicion ? this.editarVenta(this.venta) : this.guardarVenta(this.venta);
    }
  };

  validarCampos(){
    if(this.venta.tipooperacion=="01"){
      if(!this.venta.doccliente || this.venta.doccliente.length<11){
        this.toastr.info("El documento en las facturas debe ser igual a 11");
        return false;
      }
      if(!this.venta.nombrecliente){
        this.toastr.info("El nombre del cliente es obligatorio en las facturas.");
        return false;
      }
    }
    if(this.venta.tipooperacion=="03"){
      if(!this.venta.doccliente || this.venta.doccliente.length<8){
        this.venta.doccliente = "99999999";
        this.venta.nombrecliente = "CLIENTES VARIOS";
      }
      if(!this.venta.doccliente || this.venta.doccliente.length>8){
        this.venta.doccliente = "99999999";
        this.venta.nombrecliente = "CLIENTES VARIOS";
      }
      if(!this.venta.nombrecliente || this.venta.nombrecliente==""){
        this.venta.nombrecliente = "CLIENTES VARIOS";
      }
    }
    if(this.venta.tipooperacion!="07"){
      if(!this.venta.ventadetList || this.venta.ventadetList.length<=0){
        this.toastr.info("Debe añadir items a la a venta");
        return false;
      }
    }
    if(this.venta.tipooperacion=="00"){
      if(!this.venta.doccliente || this.venta.doccliente==""){
        this.venta.doccliente = "99999999";
      }
      if(!this.venta.nombrecliente || this.venta.nombrecliente==""){
        this.venta.nombrecliente = "CLIENTES VARIOS";
      }
    }
    return true;
  }

  llenarDatosParaEdicion(venta: Venta) : void {
    let tipoMon= venta.idmoneda;
    let tipomonedaselect = this.tiposMon.find(item => item.id == tipoMon.id);
    venta.idmoneda = tipomonedaselect;
    let tipoDoc= venta.idtipodocumento;
    let tipodocselect = this.tipoDocs.find(item => item.id == tipoDoc.id);
    venta.idtipodocumento = tipodocselect;
    if(venta.ventadetList){
      for(var i=0; i<venta.ventadetList.length; i++){
        if(venta.ventadetList[i].idproducto){
          let pm = {
            "estado":true,
            "precio":1,
            "idproducto":venta.ventadetList[i].idproducto.id,
            "idunidadmedida":this.u_default
          };
          venta.ventadetList[i].idproducto.productomedidaList.push(pm);
        }
        if(venta.ventadetList[i].idproducto && venta.ventadetList[i].idproducto.productomedidaList){
          let pmul = venta.ventadetList[i].idproducto.productomedidaList.find(item => item.idunidadmedida.id === this.venta.ventadetList[i].idunidadmedida.id);
          if(!pmul){
            pmul = {};
            pmul.idunidadmedida = this.u_default;
          }
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
