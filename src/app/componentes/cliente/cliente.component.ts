import { Component, OnInit, ViewChild, NgZone, ElementRef, NgModule, Input } from '@angular/core';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Paginacion } from '../../entidades/entidad.paginacion';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef} from '@angular/core';
import { SourceCodeService } from '../../source-code.service';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import{ ModalConfirmacionComponent } from './../../componentes/modal-confirmacion.component';
import { NguiMapModule } from '@ngui/map';
import { } from 'googlemaps';

import { ApiRequestService } from '../../servicios/api-request.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  @Input() isModal;
  public page: number = 1;
  public centrob: string;
  public paginacion:Paginacion;
  public solicitando = false;
  public vistaFormulario = false;
  public parametros: any = {};
  public cliente: any = {
    "idpersona":{
      "idtipodocumento":{},
      "idubigeo":{}
    }
  };
  public clientes: any = [];
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public numdoc = '';
  public nombre = '';
  public tipoDocs:any = [];
  public sexos:any = [
    {
      "id":'M',
      "nombre":"Masculino"
    },
    {
      "id":"F",
      "nombre":"Femenino"
    }
  ];
  public distritos: any = [];
  public distritoSelect: any = {};
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
    this.traerClientes();
    this.traerTipoDocs();
    let distritos = JSON.parse(localStorage.getItem("distritos"));
    distritos ? this.distritos = distritos : this.traerUbigeos('distrito',null);
    let centros = JSON.parse(localStorage.getItem("centros"));
    centros ? this.centros = centros : this.traerUbigeos('centro',1);
  }

  log(event, str) {
    if (event instanceof MouseEvent) {
      return false;
    }
    this.center = event.latLng;
    let place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
    this.placeChanged(place);
    //place.geometry.location
    console.log('event .... >', event, str);
  }

  traerTipoDocs(){
    let tipoDocs = JSON.parse(localStorage.getItem("tiposDocumento"));
    if(tipoDocs && tipoDocs.length>0){
      this.tipoDocs = tipoDocs;
    } else {
      return this.apiRequest.post('tipodocumento/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, {})
        .then(
          data => {
            if(data){
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
      "docCliente":this.numdoc,
      "nombre":this.nombre,
      "idubigeo":this.centrob
    };
    this.traerClientes();
  }

  nuevoCliente(): void {
    this.vistaFormulario = true;
    this.cliente = {
      "idpersona":{
        "idtipodocumento":{},
        "idubigeo":{}
      }
    };
  }

  initialized(autocomplete: any) {
    this.autocomplete = autocomplete;
  }

  placeChanged(place) {
    this.center = place.geometry.location;
    this.cliente.idpersona.direccion = place.formatted_address;
    for (let i = 0; i < place.address_components.length; i++) {
      let addressType = place.address_components[i].types[0];
      this.address[addressType] = place.address_components[i].long_name;
    }
    this.ref.detectChanges();
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
            switch (nombre) {
              case 'distrito':
                    this.distritos = data.extraInfo;
                    break;
              case 'centro':
                    this.centros = data.extraInfo;
                    break;
            }
          }
          else{
            this.toastr.info(data.operacionMensaje,"Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  editarCliente(id){
    this.solicitando = true;
    this.vistaFormulario = true;
    return this.apiRequest.post('cliente/obtener', {id:id})
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.cliente = data.extraInfo;
            if(!this.cliente.idpersona.idubigeo){
              this.cliente.idpersona.idubigeo={};
            }
            this.llenarCombos(this.cliente);
          }
          else{
            this.toastr.info(data.operacionMensaje,"Informacion");
            this.vistaFormulario = false;
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  confirmarEliminacion(cliente):void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarCliente(cliente);
    }, (reason) => {
    });
  }

  eliminarCliente(cliente){
    this.solicitando = true;
    return this.apiRequest.post('cliente/eliminar', {id:cliente.id})
      .then(
        data => {
          if(data && data.extraInfo){
            this.solicitando = false;
            this.cliente = data.extraInfo;
            this.clientes.splice(this.clientes.indexOf(cliente),1);
          }
          else{
            this.toastr.info(data.operacionMensaje,"Informacion");
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  llenarCombos(cliente){
    this.distritoSelect = cliente.idpersona.idubigeo ? parseInt(cliente.idpersona.idubigeo.codubigeo) : null;
    this.traerUbigeos('centro',this.distritoSelect);
  }

  traerClientes(parametros:any=this.parametros): any {
    this.solicitando = true;
    return this.apiRequest.post('cliente/pagina/'+this.page+'/cantidadPorPagina/'+this.paginacion.cantidadPorPagina, parametros)
      .then(
        data => {
          if(data){
            this.solicitando = false;
            this.solicitudExitosa = true;
            this.paginacion.totalRegistros = data.totalRegistros;
            this.paginacion.paginaActual = data.paginaActual;
            this.paginacion.totalPaginas = data.totalPaginas;
            this.clientes = data.registros;
          }
        }
      )
      .catch(err => this.usarStorage(err));
  }

  onSubmit():any{
    this.solicitando = true;
    if(this.cliente.id){
      return this.apiRequest.put('cliente', this.cliente)
        .then(
          data => {
            if(data && data.extraInfo){
              this.solicitando = false;
              this.solicitudExitosa = true;
              this.vistaFormulario = false;
              this.cliente = data.extraInfo;
              let cliente = this.clientes.find(item => item.id === this.cliente.id);
              let index = this.clientes.indexOf(cliente);
              this.clientes[index] = this.cliente;
            } else{
              this.toastr.info(data.operacionMensaje,"Informacion");
              this.solicitando = false;
            }
          }
        )
        .catch(err => this.handleError(err));
    } else{
      return this.apiRequest.post('cliente', this.cliente)
        .then(
          data => {
            if(data && data.extraInfo){
              this.solicitando = false;
              this.solicitudExitosa = true;
              this.clientes.push(data.extraInfo);
              this.vistaFormulario = false;
            } else{
              this.toastr.info(data.operacionMensaje,"Informacion");
              this.solicitando = false;
            }
          }
        )
        .catch(err => this.handleError(err));
    }
  }

  cancelar(){
    this.vistaFormulario = false;
    this.cliente = {
      "idpersona":{
        "idtipodocumento":{},
        "idubigeo":{}
      }
    };
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
      this.clientes = JSON.parse(localStorage.getItem("clientes"))
    } else {
      this.handleError(err);
    }
  }
}
