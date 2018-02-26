import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ToastrService } from 'ngx-toastr';
import{ ModalConfirmacionComponent } from './../../componentes/modal-confirmacion.component';
import { ApiRequestService } from '../../servicios/api-request.service';
import { ReportService } from '../../servicios/report.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  @ViewChild("productoDownload") productoDownload;
  @Input() isModalProducto;
  public page: number = 1;
  public paginacion:Paginacion;
  public solicitando = false;
  public vistaFormulario = false;
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public idProducto = '';
  public idCategoria: number = 0;
  public producto:any = {
    "idcategoria":{},
    "productomedidaList":[]
  };
  listaPM:any = [];
  public despro:string="";
  public productos : any = [];
  public unidades:any = [];
  public categorias:any = [];
  public file:any = [];
  public unidadSelect : any = {};
  public precio: number;
  public parametros = {
    "despro":"",
    "idcat":0
  };

  constructor(
              public activeModal: NgbActiveModal,
              private apiRequest: ApiRequestService,
              private toastr: ToastrService,
              public apiReport: ReportService,
              public auth: AuthService,
              private modalService: NgbModal
            ) {
    this.paginacion = new Paginacion();
  }

  ngOnInit() {
    this.traerProductos();
    this.traerUnidadesDeMedida();
    this.traerCategorias();
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "despro":this.despro,
      "idcat":this.idCategoria
    };
    this.traerProductos();
  }

  traerProductos(parametros:any=this.parametros): any {
    this.solicitando = true;
    return this.apiRequest.post('producto/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, parametros)
      .then(
        data => {
          if(data){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.paginacion.totalRegistros = data.totalRegistros;
            this.paginacion.paginaActual = data.paginaActual;
            this.paginacion.totalPaginas = data.totalPaginas;
            this.productos = data.registros;
          }
        }
      )
      .catch(err => this.usarStorage(err));
  }

  open(content) {
    this.precio = null;
    this.modalService.open(content).result.then((result) => {
      let productoMedida = {
        "idunidadmedida":this.unidadSelect,
        "precio":this.producto.precioventa*this.unidadSelect.cantidad,
        "estado":true,
        "idproducto":this.producto.id
      }
      if (this.unidadSelect && this.unidadSelect.id) {
        let unidadSelect = this.listaPM.find(item => item.idunidadmedida.id === this.unidadSelect.id);
        if (unidadSelect && unidadSelect.idunidadmedida && unidadSelect.idunidadmedida.id) {
          this.toastr.warning('Propiedad ya existe', 'Aviso');
        } else {
          this.listaPM.push(productoMedida);
        }
        this.unidadSelect = {};
      }
    }, (reason) => {
      this.unidadSelect = {};
      this.precio = null;
    });
  }

  traerUnidadesDeMedida(): any {
    this.solicitando = true;
    return this.apiRequest.get('unidad')
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.unidades = data.extraInfo;
          } else {
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.solicitando = false;
          }
        }
      )
      .catch(err => this.usarStorage(err));
  }

  traerCategorias(): any {
    this.solicitando = true;
    return this.apiRequest.get('categoria')
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.categorias = data.extraInfo;
          } else {
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.solicitando = false;
          }
        }
      )
      .catch(err => this.usarStorage(err));
  }

  onSubmit():any{
    this.solicitando = true;
    var formData = new FormData();
    formData.append("file", this.file);
    formData.append("producto", this.producto);
    this.producto.productomedidaList = this.listaPM;
    if(!this.producto.productomedidaList || this.producto.productomedidaList.length<=0){
      this.toastr.warning('Debe añadir unidades de medida', 'Aviso');
      this.solicitando = false;
      return;
    }
    if(this.producto.id){
      return this.apiRequest.put('producto', this.producto)
        .then(
          data => {
            if(data && data.extraInfo){
              this.solicitando = false;
              this.solicitudExitosa = true;
              this.vistaFormulario = false;
              this.producto = data.extraInfo;
              let producto = this.productos.find(item => item.id === this.producto.id);
              let index = this.productos.indexOf(producto);
              this.productos[index] = this.producto;
            }
            else{
              this.toastr.info(data.operacionMensaje,"Informacion");
              this.solicitando = false;
            }
          }
        )
        .catch(err => this.handleError(err));
    } else {
      return this.apiRequest.post('producto', this.producto)
        .then(
          data => {
            if(data && data.extraInfo){
              this.solicitando = false;
              this.solicitudExitosa = true;
              this.productos.push(data.extraInfo);
              this.vistaFormulario = false;
            }
            else{
              this.toastr.info(data.operacionMensaje,"Informacion");
              this.solicitando = false;
            }
          }
        )
        .catch(err => this.handleError(err));
    }

  }

  imprimirReporte(){
    this.solicitando = true;
    let params={
      "codusu":this.auth.getUserName(),
      "report":'rptProductos'
    };
    this.apiReport.post("reporte/generar",params)
      .then(
        data => {
          if(data){
            this.descargarArchivoPDF('application/pdf','rptDetalleBoleta.pdf',data);
          }
          this.solicitando = false;
        }
      )
      .catch(err => this.handleError(err));
  }

  descargarArchivoPDF(tipoDocumento,nombreArchivo,data){
    if(data){
      var fileName = nombreArchivo;
      var file = new Blob([data._body],{type: tipoDocumento });
      var url = URL.createObjectURL(file);
      this.productoDownload.nativeElement.href = url;
      this.productoDownload.nativeElement.target = "_blank";
      this.productoDownload.nativeElement.click();
    }else{
    }
  }

  traerParaEdicion(id){
    this.solicitando = true;
    this.vistaFormulario = true;
    return this.apiRequest.post('producto/obtener', {id:id})
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.producto = data.extraInfo;
            if(this.producto && !this.producto.idcategoria){
              this.producto.idcategoria = {};
            }
            this.listaPM = this.producto.productomedidaList && this.producto.productomedidaList.length>0 ? this.producto.productomedidaList : [];
          }
          else{
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.vistaFormulario = false;
            this.solicitando = false;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  confirmarEliminacion(producto):void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarProducto(producto);
    }, (reason) => {
    });
  }

  quitarMedida(obj):void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      if(obj && obj.id){
        this.eliminarMedida(obj);
      } else {
        this.listaPM.splice(this.listaPM.indexOf(obj),1);
        this.solicitando = false;
      }
    }, (reason) => {
    });
  }

  eliminarMedida(obj){
    this.solicitando = true;
    return this.apiRequest.post('producto/eliminarmedida', {id:obj.id})
      .then(
        data => {
          if(data && data.estadoOperacion == 'EXITO'){
            this.listaPM.splice(this.listaPM.indexOf(obj),1);
          }
          this.solicitando = false;
        }
      )
      .catch(err => this.handleError(err));
  }

  eliminarProducto(producto){
    this.solicitando = true;
    return this.apiRequest.post('producto/eliminar', {id:producto.id})
      .then(
        data => {
          if(data && data.extraInfo){
            this.productos.splice(this.productos.indexOf(producto),1);
          } else {
            this.toastr.info(data.operacionMensaje,"Informacion");
          }
          this.solicitando = false;
        }
      )
      .catch(err => this.handleError(err));
  }

  nuevo(){
    this.vistaFormulario = true;
    this.producto = {
      "idcategoria":{},
      "productomedidaList":{}
    };
    this.unidadSelect = {};
    this.precio = null;
    this.listaPM = [];
  }

  private handleError(error: any): void {
    this.toastr.error("Error interno.","Error");
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }

  usarStorage(err){
    if(err.status == 0 || err.status == 504){
      this.solicitando = false;
      this.unidades = JSON.parse(localStorage.getItem("unidades"));
      this.categorias = JSON.parse(localStorage.getItem("categorias"));
      this.productos = JSON.parse(localStorage.getItem("productos"));
    } else {
      this.handleError(err);
    }
  }

}
