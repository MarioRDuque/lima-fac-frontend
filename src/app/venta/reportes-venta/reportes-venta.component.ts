import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';
import { ReportService } from '../../servicios/report.service';

@Component({
  selector: 'app-reportes-venta',
  templateUrl: './reportes-venta.component.html',
  styleUrls: ['./reportes-venta.component.css']
})
export class ReportesVentaComponent implements OnInit {

  @ViewChild("exelDownload") exelDownload;
  public inicio:NgbDateStruct;
  public fin:NgbDateStruct;
  public cargando = false;

  constructor(
    public api: ApiRequestService,
    public apiReport: ReportService,
    public auth: AuthService
  ) { }

  ngOnInit() {
  }

  descargarReporte(nombre){
    this.cargando = true;
    let params={
      "codusu":this.auth.getUserName(),
      "report":nombre,
      "inicio": this.inicio ? new Date(this.inicio.year, this.inicio.month - 1,this.inicio.day) : null,
      "fin": this.fin ? new Date(this.fin.year,this.fin.month - 1,this.fin.day): null
    }
    this.apiReport.post("reporte/generar",params)
      .then(
        data => {
          if(data){
            this.descargarArchivoPDF('application/pdf',nombre+'.pdf',data);
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  descargarArchivoPDF(tipoDocumento,nombreArchivo,data){
    if(data){
      var fileName = nombreArchivo;
      var file = new Blob([data._body],{type: tipoDocumento });
      var url = URL.createObjectURL(file);
      this.exelDownload.nativeElement.href = url;
      //this.exelDownload.nativeElement.download = fileName;
      this.exelDownload.nativeElement.target = "_blank";
      this.exelDownload.nativeElement.click();
      //this.toastr.success("Documento generado correctamente", "Exito");
      this.cargando = false;
    }else{
      //this.toastr.error('Error generando documento', 'Error');
      this.cargando = false;
    }
  }

  private handleError(error: any): void {
    this.cargando = false;
    console.log(error);
  }

}
