import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ProveedorComponent } from '../../proveedor/proveedor.component';
import { Compra } from '../../entidades/entidad.compra';
import { Compradet } from '../../entidades/entidad.compradet';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ProductoComponent } from '../../producto/producto.component';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';
import { ReportService } from '../../servicios/report.service';
import { ConfirmacionComponent } from '../../util/confirmacion/confirmacion.component';
import { DetalleImeisComponent } from '../../venta/venta-formulario/detalle-imeis/detalle-imeis.component';

@Component({
  selector: 'app-compra-formulario',
  templateUrl: './compra-formulario.component.html',
  styleUrls: ['./compra-formulario.component.css']
})
export class CompraFormularioComponent implements OnInit {

  public paginacion: Paginacion;
  compra: Compra;
  compras: any = [];
  tipoDocs: any = [];
  tiposMon: any = [];
  igv: number = 0;
  idcompra: number;
  proveedor: any = {};
  public page: number = 1;
  tiposOperacion = [
    {
      id: '03',
      nombre: "BOLETA"
    },
    {
      id: '01',
      nombre: "FACTURA"
    },
    {
      id: '07',
      nombre: "NOTA DE CREDITO"
    },
    {
      id: '00',
      nombre: "NOTA DE PEDIDO"
    }
  ];
  importe: number = 0;
  public idPedido: number;
  public esEdicion: boolean = false;
  public solicitando: boolean = false;
  public cargando: boolean = false;
  public solicitudExitosa = false;
  public mensajeForUser: string = "";
  public productos: any = [];
  public seriecorrelativo;
  public u_default: any;
  public proveedores: any = [];
  public param: any = {};
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
    this.compra = new Compra();
  }

  ngOnInit() {
    this.compra.tipooperacion = this.tiposOperacion[0].id;
    this.cargando = true;
    this.traerTipoDocs();
    this.traerTiposMon();
    this.traerIGV();
    this.traerUDefault();
    this.route.params.subscribe(params => {
      if (params['id'] != null) {
        this.idPedido = +params['id'];
        this.esEdicion = true;
        this.traerCompra();
      } else {
        this.cargando = false;
      }
    });
  };

  search(event) {
    this.traerProveedores(event.query);

    /*this.mylookupservice.getResults(event.query).then(data => {
      this.results = data;
    });*/
  }

  traerProveedores(query): any {
    this.param = {
      "docProveedor": this.compra.docproveedor
    };
    this.solicitando = true;
    return this.api.post('proveedor/pagina/' + 1 + '/cantidadPorPagina/' + this.paginacion.cantidadPorPagina, this.param)
      .then(
        data => {
          if (data) {
            this.solicitando = false;
            this.proveedores = data.registros;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  abrirProveedores(): void {
    const modalRef = this.modalService.open(ProveedorComponent, { size: 'lg', keyboard: false });
    modalRef.componentInstance.isModal = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      this.compra.nombreproveedor = reason && reason.idpersona ? reason.idpersona.nombrecompleto : "";
      this.compra.docproveedor = reason && reason.idpersona ? reason.idpersona.numdocumento : "";
    });
  };

  buscarCompra(): void {
    this.cargando = true;
    this.api.post('compra/pagina/' + this.page + '/cantidadPorPagina/' + this.paginacion.cantidadPorPagina, { seriecorrelativo: this.seriecorrelativo })
      .then(data => {
        if (data && data.registros) {
          this.cargando = false;
          this.compras = data.registros;
        } else {
          this.toastr.info("No se encontró documento.", "Aviso");
          this.cargando = false;
        }
      })
      .catch(err => this.handleError(err));
  }

  traerTipoDocs() {
    let tipoDocs = JSON.parse(localStorage.getItem("tiposDocumento"));
    if (tipoDocs && tipoDocs.length > 0) {
      this.tipoDocs = tipoDocs;
      this.compra.idtipodocumento = this.tipoDocs[0];
    } else {
      return this.api.post('tipodocumento/pagina/' + this.page + '/cantidadPorPagina/' + this.paginacion.cantidadPorPagina, {})
        .then(
          data => {
            if (data) {
              this.tipoDocs = data.registros;
              this.compra.idtipodocumento = this.tipoDocs[0];
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  traerTiposMon() {
    let tiposMon = JSON.parse(localStorage.getItem("monedas"));
    if (tiposMon && tiposMon.length > 0) {
      this.tiposMon = tiposMon;
      this.compra.idmoneda = this.tiposMon[0];
    } else {
      return this.api.get('moneda')
        .then(
          data => {
            if (data && data.extraInfo) {
              this.tiposMon = data.extraInfo;
              this.compra.idmoneda = this.tiposMon[0];
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  traerIGV() {
    this.cargando = true;
    let igv = JSON.parse(localStorage.getItem("igv"));
    if (igv) {
      this.igv = igv.valor;
      this.cargando = false;
    } else {
      return this.api.get('parametro/igv')
        .then(
          data => {
            if (data && data.extraInfo) {
              this.igv = data.extraInfo[0].valor;
            } else {
              this.toastr.error("No se encontró valor para el IGV, por favor recargar la página.", "Alerta");
            }
            this.cargando = false;
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  traerUDefault() {
    this.cargando = true;
    let unidad = JSON.parse(localStorage.getItem("unidaddefault"));
    if (unidad) {
      this.u_default = unidad;
      this.cargando = false;
    } else {
      return this.api.get('unidad/default')
        .then(
          data => {
            if (data && data.extraInfo) {
              this.u_default = data.extraInfo;
              localStorage.setItem("unidaddefault", JSON.stringify(this.u_default));
            } else {
              this.toastr.error("No se encontró unidad por defecto por favor recargar la página.", "Alerta");
            }
            this.cargando = false;
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  confirmarEliminacionDetalle(o): void {
    const modalRef = this.modalService.open(ConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarDetalle(o);
    }, (reason) => {
    });
  }

  eliminarDetalle(o) {
    if (o.id) {
      this.solicitando = true;
      this.api.get('compra/eliminardetalle/' + o.id)
        .then(data => {
          if (data.extraInfo) {
            this.toastr.success(data.operacionMensaje, 'Exito');
            this.compra.compradetList.splice(this.compra.compradetList.indexOf(o), 1);
          } else {
            this.toastr.error(data.operacionMensaje, 'Error');
          }
          this.solicitando = false;
          this.solicitudExitosa = true;
          this.calcularImporte();
        })
        .catch(err => this.handleError(err));
    } else {
      this.compra.compradetList.splice(this.compra.compradetList.indexOf(o), 1);
      this.calcularImporte();
    }
  }

  abrirProductos(): void {
    const modalRef = this.modalService.open(ProductoComponent, { size: 'lg', keyboard: false });
    modalRef.componentInstance.isModalProducto = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      if (reason && reason.id) {
        let detalle = new Compradet();
        detalle.idproducto = reason;
        detalle.idcompra = this.compra.id;
        if (!reason.productomedidaList[0]) {
          let pm = {
            "estado": true,
            "precio": 1,
            "idproducto": reason.id,
            "idunidadmedida": this.u_default
          };
          reason.productomedidaList.push(pm);
        }
        detalle.idunidadmedida = reason && reason.productomedidaList[0] ? reason.productomedidaList[0].idunidadmedida : {};
        detalle.preciounitario = reason.productomedidaList[0].precio > 0 ? reason.productomedidaList[0].precio : 0;
        detalle.preciototal = 1 * reason.productomedidaList[0].precio > 0 ? reason.productomedidaList[0].precio : 0;
        if (reason.afectoigv) {
          detalle.afectacionigv = "10";
        }
        this.compra.compradetList.push(detalle);
        this.operaciones(detalle);
      }
    });
  }

  obtenerPrecio(detalle) {
    let producto = detalle.idproducto;
    let pm = producto.productomedidaList;
    let unidad = detalle.idunidadmedida;
    let pmSelect = pm.find(item => item.idunidadmedida.id === unidad.id);
    detalle.preciounitario = pmSelect.precio;
    this.operaciones(detalle);
  };

  traerCompra(id: number = this.idPedido, ruta: string = '/compra/obtenerEntidad'): void {
    this.solicitando = true;
    this.api.post(ruta, { "id": id })
      .then(data => {
        if (data.extraInfo) {
          this.compra = data.extraInfo;
          this.calcularImporte();
          this.llenarDatosParaEdicion(this.compra);
        } else {
          this.toastr.error(data.operacionMensaje, 'Error');
          this.router.navigate(['./compra/lista/' + id]);
        }
        this.solicitando = false;
        this.solicitudExitosa = true;
      })
      .catch(err => this.volverAlista(err));
  };

  validarDocumento() {
    return this.api.post('proveedor/obtenerv', { dni: this.compra.docproveedor })
      .then(
        data => {
          if (data && data.extraInfo) {
            this.solicitando = false;
            this.compra.nombreproveedor = data.extraInfo.nombre;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  generarNotaPedido(id) {
    this.cargando = true;
    this.api.get("compra/notapedido/" + id + "/descripcion/" + this.compra.descripcion)
      .then(respuesta => {
        if (respuesta && respuesta.extraInfo) {
          this.cargando = false;
          this.toastr.success(respuesta.operacionMensaje, 'Exito');
          this.router.navigate(['./compras/lista/']);
        } else {
          this.cargando = false;
          this.toastr.error(respuesta.operacionMensaje, 'Error');
        }
      })
      .catch(err => this.handleError(err));
  }

  guardarCompra(compraParam: any) {
    this.cargando = true;
    compraParam.usuariosave = this.auth.getUserName();
    if (compraParam.tipooperacion == '03') {
      compraParam.idtipodocumento = this.tipoDocs.find(item => item.id == 1);
    }
    if (compraParam.tipooperacion == '01') {
      compraParam.idtipodocumento = this.tipoDocs.find(item => item.id == 2);
    }
    this.api.post("compra", compraParam)
      .then(respuesta => {
        if (respuesta && respuesta.extraInfo) {
          this.idcompra = respuesta.extraInfo;
          this.solicitudExitosa = true;
          this.toastr.success(respuesta.operacionMensaje, 'Exito');
          this.limpiarCampos();
          this.imprimirBoleta();
          this.cargando = false;
        } else {
          this.solicitudExitosa = false;
          this.toastr.error(respuesta.operacionMensaje, 'Error');
          this.cargando = false;
        }
      })
      .catch(err => this.handleError(err));
  };

  editarCompra(compraParam: Compra) {
    this.cargando = true;
    compraParam.fechaemision = new Date(compraParam.fechaemision);
    compraParam.fechaemision.setDate(compraParam.fechaemision.getDate() + 1);
    compraParam.usuarioupdate = this.auth.getUserName();
    if (compraParam.tipooperacion == '03') {
      compraParam.idtipodocumento = this.tipoDocs.find(item => item.id == 1);
    }
    if (compraParam.tipooperacion == '01') {
      compraParam.idtipodocumento = this.tipoDocs.find(item => item.id == 2);
    }
    this.api.put("compra", compraParam)
      .then(respuesta => {
        if (respuesta !== undefined) {
          if (respuesta && respuesta.extraInfo) {
            this.idcompra = respuesta.extraInfo;
            this.solicitudExitosa = true;
            this.toastr.success(respuesta.operacionMensaje, 'Exito');
            this.imprimirBoleta();
          } else {
            this.solicitudExitosa = false;
            this.toastr.error(respuesta.operacionMensaje, 'Error');
          }
          this.cargando = false;
        }
      })
      .catch(err => this.handleError(err));
  };

  imprimirBoleta() {
    this.cargando = true;
    let params = {
      "codusu": this.auth.getUserName(),
      "report": 'rptBoletaSunat',
      "idCompra": this.idcompra
    };
    this.apiReport.post("reporte/generarsunat", params)
      .then(
        data => {
          if (data) {
            this.descargarArchivoPDF('application/pdf', 'rptDetalleBoleta.pdf', data);
            this.cargando = false;
            this.router.navigate(['./compras/lista/']);
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  descargarArchivoPDF(tipoDocumento, nombreArchivo, data) {
    if (data) {
      var fileName = nombreArchivo;
      var file = new Blob([data._body], { type: tipoDocumento });
      var url = URL.createObjectURL(file);
      this.boletaDownload.nativeElement.href = url;
      this.boletaDownload.nativeElement.target = "_blank";
      this.boletaDownload.nativeElement.click();
    }
  }

  nuevoCompra() {
    this.router.navigate(["./compra/formulario"]);
  };

  operacionesIGV() {
    if (this.compra && this.compra.compradetList && this.compra.compradetList.length > 0) {
      for (let i = 0; i < this.compra.compradetList.length; i++) {
        this.operaciones(this.compra.compradetList[i]);
      }
    }

  }

  operaciones(detalle) {
    if (detalle.descuentounitario > detalle.preciounitario) {
      detalle.descuentounitario = detalle.preciounitario;
    }
    detalle.descuentototal = detalle.descuentounitario * detalle.cantidad;
    if (detalle.afectacionigv == "20") {
      detalle.igvitem = 0;
      detalle.valorunitariosinigv = detalle.preciounitario - detalle.descuentounitario;
    } else {
      detalle.valorunitariosinigv = (detalle.preciounitario / (1 + this.igv * 1)) - detalle.descuentounitario;
      //detalle.igvitem = (detalle.preciounitario - detalle.valorunitariosinigv) * detalle.cantidad;
      detalle.igvitem = (this.igv * detalle.valorunitariosinigv) * detalle.cantidad;
    }
    detalle.preciototalsinigv = (detalle.valorunitariosinigv * detalle.cantidad);
    detalle.preciototal = detalle.preciototalsinigv + detalle.igvitem;
    detalle.igvitem = Math.round(detalle.igvitem * 100) / 100;
    detalle.preciototalsinigv = Math.round(detalle.preciototalsinigv * 100) / 100;
    detalle.valorunitariosinigv = Math.round(detalle.valorunitariosinigv * 100) / 100;
    detalle.preciototal = Math.round(detalle.preciototal * 100) / 100;
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
    this.router.navigate(["./compras/lista"]);
  };

  calcularImporte() {
    this.importe = 0;
    this.compra.totaldesc = 0;
    this.compra.totalsinigv = 0;
    this.compra.valopeexo = 0;
    this.compra.igv = 0;
    for (var i = 0; i < this.compra.compradetList.length; i++) {
      this.importe = this.compra.compradetList[i].preciototal + this.importe;
      this.compra.totaldesc = this.compra.compradetList[i].descuentototal + this.compra.totaldesc;
      if (this.compra.compradetList[i].afectacionigv == "20") {
        this.compra.valopeexo = this.compra.valopeexo + this.compra.compradetList[i].preciototal;
        this.compra.igv = this.compra.igv + this.compra.compradetList[i].igvitem;
      } else {
        this.compra.totalsinigv = this.compra.compradetList[i].preciototalsinigv + this.compra.totalsinigv;
        this.compra.igv = this.compra.igv + this.compra.compradetList[i].igvitem;
      }
    }
    this.compra.importetotal = Math.round(this.importe * 100) / 100;
    this.compra.totaldesc = Math.round(this.compra.totaldesc * 100) / 100;
    /*this.compra.totalsinigv = this.importe - this.importe*this.igv;*/
    this.compra.igv = Math.round(this.compra.igv * 100) / 100;
    this.compra.totalsinigv = Math.round(this.compra.totalsinigv * 100) / 100;
    this.compra.valopeexo = Math.round(this.compra.valopeexo * 100) / 100;
  };

  onSubmit(): void {
    this.mensajeForUser = 'Guardando ...';
    if (this.validarCampos()) {
      this.compra.importetotal = Math.round(this.compra.importetotal * 100) / 100;
      this.esEdicion ? this.editarCompra(this.compra) : this.guardarCompra(this.compra);
    }
  };

  verDetalle(detalle) {
    const modalRef = this.modalService.open(DetalleImeisComponent, { size: 'lg', keyboard: false });
    modalRef.componentInstance.detalle = detalle;
    modalRef.result.then((result) => {
    }, (reason) => {
    });
  }

  validarCampos() {
    if (this.compra.tipooperacion == "01") {
      if (!this.compra.docproveedor || this.compra.docproveedor.length < 11) {
        this.toastr.info("El documento en las facturas debe ser igual a 11");
        return false;
      }
      if (!this.compra.nombreproveedor) {
        this.toastr.info("El nombre del proveedor es obligatorio en las facturas.");
        return false;
      }
    }
    if (this.compra.tipooperacion == "03") {
      if (!this.compra.docproveedor || this.compra.docproveedor.length < 8) {
        this.compra.docproveedor = "99999999";
        this.compra.nombreproveedor = "CLIENTES VARIOS";
      }
      if (!this.compra.docproveedor || this.compra.docproveedor.length > 8) {
        this.compra.docproveedor = "99999999";
        this.compra.nombreproveedor = "CLIENTES VARIOS";
      }
      if (!this.compra.nombreproveedor || this.compra.nombreproveedor == "") {
        this.compra.nombreproveedor = "CLIENTES VARIOS";
      }
    }
    if (this.compra.tipooperacion != "07") {
      if (!this.compra.compradetList || this.compra.compradetList.length <= 0) {
        this.toastr.info("Debe añadir items a la a compra");
        return false;
      }
    }
    if (this.compra.tipooperacion == "00") {
      if (!this.compra.docproveedor || this.compra.docproveedor == "") {
        this.compra.docproveedor = "99999999";
      }
      if (!this.compra.nombreproveedor || this.compra.nombreproveedor == "") {
        this.compra.nombreproveedor = "CLIENTES VARIOS";
      }
    }
    return true;
  }

  llenarDatosParaEdicion(compra: Compra): void {
    let tipoMon = compra.idmoneda;
    let tipomonedaselect = this.tiposMon.find(item => item.id == tipoMon.id);
    compra.idmoneda = tipomonedaselect;
    let tipoDoc = compra.idtipodocumento;
    let tipodocselect = this.tipoDocs.find(item => item.id == tipoDoc.id);
    compra.idtipodocumento = tipodocselect;
    if (compra.compradetList) {
      for (var i = 0; i < compra.compradetList.length; i++) {
        if (compra.compradetList[i].idproducto) {
          let pm = {
            "estado": true,
            "precio": 1,
            "idproducto": compra.compradetList[i].idproducto.id,
            "idunidadmedida": this.u_default
          };
          compra.compradetList[i].idproducto.productomedidaList.push(pm);
        }
        if (compra.compradetList[i].idproducto && compra.compradetList[i].idproducto.productomedidaList) {
          let pmul = compra.compradetList[i].idproducto.productomedidaList.find(item => item.idunidadmedida.id === this.compra.compradetList[i].idunidadmedida.id);
          if (!pmul) {
            pmul = {};
            pmul.idunidadmedida = this.u_default;
          }
          this.compra.compradetList[i].idunidadmedida = pmul.idunidadmedida;
        }
      }
    }
    this.cargando = false;
  };

  private limpiarCampos() {
    this.compra = new Compra();
  };

}
