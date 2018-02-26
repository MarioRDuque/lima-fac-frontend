import { Component, Input, OnInit } from '@angular/core';

import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ModalLogin } from '../app.component';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

const NOW = new Date();
const ESTADO_RIESGO = 'R';

@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  public menus:any = [];

  constructor(private modalService: NgbModal,
              private authService: AuthService,
              public router: Router) {}

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

}
