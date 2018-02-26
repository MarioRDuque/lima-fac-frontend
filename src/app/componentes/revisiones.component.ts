import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-revisiones',
  templateUrl: './revisiones.component.html',
  styleUrls: ['./revisiones.component.css']
})
export class RevisionesComponent implements OnInit {

  @Input() idEvento;

  solicitando:boolean=false;
  solicitudExitosa:boolean=false;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
