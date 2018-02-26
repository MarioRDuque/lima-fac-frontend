import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import{ ModalConfirmacionComponent } from './../../../componentes/modal-confirmacion.component'
import{ RevisionesComponent } from './../../../componentes/revisiones.component'

import { PedidosService } from '../servicios/pedidos.service';
import { ApiRequestService } from '../../../servicios/api-request.service';
import { AuthService } from '../../../servicios/auth.service';
import { ReportService } from '../../../servicios/report.service';

@Component({
  selector: 'app-pedido-seguimiento',
  templateUrl: './pedido-seguimiento.component.html',
  styleUrls: ['./pedido-seguimiento.component.css']
})
export class PedidoSeguimientoComponent implements OnInit {

  @ViewChild("boletaDownload") boletaDownload;
  lat: number = -5.0925000;
  lng: number = -80.1625000;
  idPedido : number;
  importe: number = 0;
  solicitando : boolean = false;
  solicitudExitosa : boolean = false;
  mensajeForUser : string = "";
  public pedido: any = {
    "idcliente":{
      "idpersona":{}
    },
    "detallePedidoList":{
      "idproducto":{}
    }
  };

  constructor(
  	private eventosService: PedidosService,
  	private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private api: ApiRequestService,
    private modalService: NgbModal,
    public apiReport: ReportService,
    public auth: AuthService
    ) {
  }

  ngOnInit() {
  	this.route.params.subscribe(params => {
        if(params['id']!=null){
            this.idPedido = +params['id'];
            this.obtenerpedido();
        } else {
        	console.log("error");
        }
     });
  }

  obtenerpedido(id:number=this.idPedido, ruta:string='/pedidos/obtenerEntidad'): void {
    this.solicitando = true;
    this.eventosService.obtener(id,ruta)
      .then(data => {
        if(data.extraInfo){
          this.pedido = data.extraInfo;
          this.calcularImporte();
        } else {
        	this.toastr.error(data.operacionMensaje, 'Error');
        	this.router.navigate(['./pedidos/lista']);
        }
        this.solicitando = false;
        this.solicitudExitosa = true;
      })
      .catch(err => this.handleError(err));
  }

  confirmarCierre(string):void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      if(string=='venta'){
        this.cerrarpedido();
      } else {
        this.imprimirBoleta();
      }
    }, (reason) => {
    });
  }

  imprimirBoleta(){
    this.solicitando = true;
    let params={
      "codusu":this.auth.getUserName(),
      "report":'rptBoleta',
      "idPedido":this.pedido.id
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
      this.boletaDownload.nativeElement.href = url;
      this.boletaDownload.nativeElement.target = "_blank";
      //this.boletaDownload.nativeElement.download = fileName;
      this.boletaDownload.nativeElement.click();
    }else{
    }
  }

  confirmarEliminacion():void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarpedido();
    }, (reason) => {
    });
  }

  calcularImporte() {
    this.importe = 0;
    for(var i=0; i<this.pedido.detallePedidoList.length; i++){
      this.importe = this.pedido.detallePedidoList[i].preciototal + this.importe;
    }
    this.importe;
  }

  abrirRevisiones():void{
    const modalRef = this.modalService.open(RevisionesComponent, { size: 'lg', keyboard: false});
    modalRef.componentInstance.idPedido = this.idPedido;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      this.ngOnInit();
    });
  }

  cerrarpedido(): void {
    this.solicitando = true;
    this.api.post("pedidos/cerrar",{id:this.idPedido})
      .then(data => {
        if(data.extraInfo){
          this.toastr.success(data.operacionMensaje, 'Exito');
          this.router.navigate(['./pedidos/lista']);
        }
        else{
          this.toastr.error(data.operacionMensaje, 'Error');
        }
        this.solicitando = false;
        this.solicitudExitosa = true;
      })
      .catch(err => this.handleError(err));
  }

  eliminarpedido(): void {
    this.solicitando = true;
    this.eventosService.eliminar(this.idPedido)
      .then(data => {
        if(data.extraInfo){
          this.toastr.success(data.operacionMensaje, 'Exito');
          this.router.navigate(['./pedidos/lista']);
        }
        else{
          this.toastr.error(data.operacionMensaje, 'Error');
        }
        this.solicitando = false;
        this.solicitudExitosa = true;
      })
      .catch(err => this.handleError(err));
  }

  private handleError(error: any): void {
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.toastr.error('Ups Error', 'Error');
    this.router.navigate(['./pedidos/lista']);
  }

}
