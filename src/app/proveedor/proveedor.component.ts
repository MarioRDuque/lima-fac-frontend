import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Paginacion } from '../entidades/entidad.paginacion';
import { ApiRequestService } from '../servicios/api-request.service';
import { SourceCodeService } from '../source-code.service';
import { ConfirmacionComponent } from '../util/confirmacion/confirmacion.component';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {

  @Input() isModal;
  public page: number = 1;
  public centrob: string;
  public paginacion: Paginacion;
  public solicitando = false;
  public vistaFormulario = false;
  public parametros: any = {};
  public proveedor: any = {
    "idpersona": {
      "idtipodocumento": {},
      "idubigeo": {}
    }
  };
  public proveedores: any = [];
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public numdoc = '';
  public nombre = '';
  public tipoDocs: any = [];
  public sexos: any = [
    {
      "id": 'M',
      "nombre": "Masculino"
    },
    {
      "id": "F",
      "nombre": "Femenino"
    }
  ];
  public distritos: any = [];
  public distritoSelect: any = null;
  public centros: any = [];
  autocomplete: any;
  address: any = {};
  center: any;
  code: string;

  constructor(public activeModal: NgbActiveModal,
    private apiRequest: ApiRequestService,
    private toastr: ToastrService,
    private ref: ChangeDetectorRef,
    public sc: SourceCodeService,
    private modalService: NgbModal
  ) {
    sc.getText('PlacesAutoCompleteComponent').subscribe(text => this.code = text);
    sc.getText('SimpleMarkerComponent').subscribe(text => this.code = text);
    this.paginacion = new Paginacion();
  }

  ngOnInit() {
    this.traerProveedores();
    this.traerTipoDocs();
    let distritos = JSON.parse(localStorage.getItem("distritos"));
    distritos ? this.distritos = distritos : this.traerUbigeos('distrito', null);
    let centros = JSON.parse(localStorage.getItem("centros"));
    centros ? this.centros = centros : this.traerUbigeos('centro', 1);
  }

  log(event, str) {
    if (event instanceof MouseEvent) {
      return false;
    }
    this.center = event.latLng;
    let place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
    this.placeChanged(place);
    console.log('event .... >', event, str);
  }

  traerTipoDocs() {
    let tipoDocs = JSON.parse(localStorage.getItem("tiposDocumento"));
    if (tipoDocs && tipoDocs.length > 0) {
      this.tipoDocs = tipoDocs;
    } else {
      return this.apiRequest.post('tipodocumento/pagina/' + this.page + '/cantidadPorPagina/' + this.paginacion.cantidadPorPagina, {})
        .then(
          data => {
            if (data) {
              this.tipoDocs = data.registros;
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "docProveedor": this.numdoc,
      "nombre": this.nombre,
      "idubigeo": this.centrob
    };
    this.traerProveedores();
  }

  nuevoProveedor(): void {
    this.vistaFormulario = true;
    this.proveedor = {
      "idpersona": {
        "idtipodocumento": {},
        "idubigeo": {}
      }
    };
  }

  initialized(autocomplete: any) {
    this.autocomplete = autocomplete;
  }

  placeChanged(place) {
    this.center = place.geometry.location;
    this.proveedor.idpersona.direccion = place.formatted_address;
    for (let i = 0; i < place.address_components.length; i++) {
      let addressType = place.address_components[i].types[0];
      this.address[addressType] = place.address_components[i].long_name;
    }
    this.ref.detectChanges();
  }

  traerUbigeos(nombre, padre) {
    let centros = JSON.parse(localStorage.getItem("centros"));
    if (centros) {
      this.centros = centros;
    }
    return this.apiRequest.post('ubigeo/listar', { padre: padre })
      .then(
        data => {
          if (data && data.extraInfo) {
            switch (nombre) {
              case 'distrito':
                this.distritos = data.extraInfo;
                break;
              case 'centro':
                this.centros = data.extraInfo;
                break;
            }
          }
          else {
            this.toastr.info(data.operacionMensaje, "Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  editarProveedor(id) {
    this.solicitando = true;
    this.vistaFormulario = true;
    return this.apiRequest.post('proveedor/obtener', { id: id })
      .then(
        data => {
          if (data && data.extraInfo) {
            this.solicitando = false;
            this.proveedor = data.extraInfo;
            if (!this.proveedor.idpersona.idubigeo) {
              this.proveedor.idpersona.idubigeo = {};
            }
            this.llenarCombos(this.proveedor);
          }
          else {
            this.toastr.info(data.operacionMensaje, "Informacion");
            this.vistaFormulario = false;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  confirmarEliminacion(proveedor): void {
    const modalRef = this.modalService.open(ConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarProveedor(proveedor);
    }, (reason) => {
    });
  }

  eliminarProveedor(proveedor) {
    this.solicitando = true;
    return this.apiRequest.post('proveedor/eliminar', { id: proveedor.id })
      .then(
        data => {
          if (data && data.extraInfo) {
            this.solicitando = false;
            this.proveedor = data.extraInfo;
            this.proveedores.splice(this.proveedores.indexOf(proveedor), 1);
          }
          else {
            this.toastr.info(data.operacionMensaje, "Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  llenarCombos(proveedor) {
    this.distritoSelect = proveedor.idpersona.idubigeo ? parseInt(proveedor.idpersona.idubigeo.codubigeo) : null;
    this.traerUbigeos('centro', this.distritoSelect);
  }

  traerProveedores(parametros: any = this.parametros): any {
    this.solicitando = true;
    return this.apiRequest.post('proveedor/pagina/' + this.page + '/cantidadPorPagina/' + this.paginacion.cantidadPorPagina, parametros)
      .then(
        data => {
          if (data) {
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.paginacion.totalRegistros = data.totalRegistros;
            this.paginacion.paginaActual = data.paginaActual;
            this.paginacion.totalPaginas = data.totalPaginas;
            this.proveedores = data.registros;
          }
        }
      )
      .catch(err => this.usarStorage(err));
  }

  onSubmit(): any {
    this.solicitando = true;
    if (!this.distritoSelect) {
      this.proveedor.idpersona.idubigeo = null;
    }
    if (this.proveedor.id) {
      return this.apiRequest.put('proveedor', this.proveedor)
        .then(
          data => {
            if (data && data.extraInfo) {
              this.solicitando = false;
              this.solicitudExitosa = true;
              this.vistaFormulario = false;
              this.proveedor = data.extraInfo;
              let proveedor = this.proveedores.find(item => item.id === this.proveedor.id);
              let index = this.proveedores.indexOf(proveedor);
              this.proveedores[index] = this.proveedor;
            } else {
              this.toastr.info(data.operacionMensaje, "Informacion");
              this.solicitando = false;
            }
          }
        )
        .catch(err => this.handleError(err));
    } else {
      return this.apiRequest.post('proveedor', this.proveedor)
        .then(
          data => {
            if (data && data.extraInfo) {
              this.solicitando = false;
              this.solicitudExitosa = true;
              this.proveedores.push(data.extraInfo);
              this.vistaFormulario = false;
            } else {
              this.toastr.info(data.operacionMensaje, "Informacion");
              this.solicitando = false;
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  cancelar() {
    this.vistaFormulario = false;
    this.proveedor = {
      "idpersona": {
        "idtipodocumento": {},
        "idubigeo": {}
      }
    };
  }

  private handleError(error: any): void {
    this.toastr.error("Error interno.", "Error");
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }

  usarStorage(err) {
    if (err.status == 0 || err.status == 504) {
      this.solicitando = false;
      this.proveedores = JSON.parse(localStorage.getItem("proveedores"))
    } else {
      this.handleError(err);
    }
  }

}
