import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-detalle-imeis',
  templateUrl: './detalle-imeis.component.html',
  styleUrls: ['./detalle-imeis.component.css']
})
export class DetalleImeisComponent implements OnInit {

  @Input() detalle;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

}
