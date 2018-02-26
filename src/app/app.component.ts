import { NgModule, Component, Pipe, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { AuthService } from './servicios/auth.service';
import { ApiRequestService } from './servicios/api-request.service';
import { ToastrService } from 'ngx-toastr';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: './app.login.component.html',
  styleUrls: ['./app.login.component.css']
})
export class ModalLogin implements OnInit {

  myform: FormGroup;
  usuario: FormControl;
  password: FormControl;
  user: any = {};
  cargando: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public router: Router,
    public apiService: ApiRequestService,
    public authService: AuthService,
    public toastr: ToastrService
  ) {
    //let db = new AngularIndexedDB('myDb', 1);
  }

  ngOnInit() {
    if(this.authService.hayToken()){
      this.activeModal.close();
    }
    /*let db = new AngularIndexedDB('myDb', 1);
    db.openDatabase(1, (evt) => {
      let objectStore = evt.currentTarget.result.createObjectStore(
        'people', { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("name", "name", { unique: false });
      objectStore.createIndex("email", "email", { unique: true });
    });*/
  }

  ingresar() {
    this.cargando = true;
    this.authService.ingresar(this.user.username, this.user.password)
    .then(
      resp => {
        if (resp.user === undefined || resp.user.userId === undefined || resp.user.token === "INVALID") {
          this.toastr.error('Usuario o clave incorrecta', 'Error');
          this.authService.cerrarSession();
          this.cargando = false;
          return;
        }
        this.cargando = false;
        this.activeModal.close();
      },
      errResponse => {
        this.authService.cerrarSession();
        switch (errResponse.status) {
          case 401:
          case 403:
            this.toastr.error('Usuario o clave incorrecta', 'Error');
            break;
          default:
            this.toastr.error('Error interno', 'Error');
        }
        this.cargando = false;
      }
      );
  }

  salir() {
    this.authService.cerrarSession();
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  cargando:boolean=false;
  menus:any = {};
  collapseNav = false;

	constructor(
    public modalService: NgbModal,
    public router: Router,
    public authService: AuthService,
    public toastr: ToastrService
  ) {
  }

  open() {
    const modalRef = this.modalService.open(ModalLogin);
    modalRef.result.then((result) => {
      if(this.authService.hayToken()){
        this.menus = this.authService.getMenus();
        this.router.navigate([this.authService.urlDestino]);
      }
    }, (reason) => {
      if(this.authService.hayToken()){
        this.router.navigate([this.authService.urlDestino]);
      }
    });
  }

  salir() {
    if(this.menus != undefined){
      this.limpiarArray(this.menus);
    }
    this.authService.cerrarSession();
  }

  toggleNav(){
    this.collapseNav = this.collapseNav ? false: true;
  }

  navegar(url){
    this.router.navigate([url]);
    this.toggleNav();
  }

  private limpiarArray(arreglo: Array<any>){
    if(arreglo != undefined){
        while(arreglo.length > 0) {
          arreglo.pop();
      }
    }
  }
}
