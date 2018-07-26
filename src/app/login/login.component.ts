import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { AuthService } from '../servicios/auth.service';
import { ApiRequestService } from '../servicios/api-request.service';
import { ToastrService } from 'ngx-toastr';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  /*myform: FormGroup;
  usuario: FormControl;
  password: FormControl;*/
  user: any ={
    
  } ;

  cargando: boolean = false;

  constructor(
    public router: Router,
    public authService: AuthService,
    public toastr: ToastrService
  ) {
  }

  ngOnInit() {
    localStorage.clear();
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
          this.router.navigate(["/"]);
          window.location.reload();
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
