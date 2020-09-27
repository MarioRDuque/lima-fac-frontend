import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiRequestService } from '../../servicios/api-request.service';
import { AuthService } from '../../servicios/auth.service';
import { ReportService } from '../../servicios/report.service';

@Component({
  selector: 'app-reportes-compra',
  templateUrl: './reportes-compra.component.html',
  styleUrls: ['./reportes-compra.component.css']
})
export class ReportesCompraComponent implements OnInit {

  @ViewChild("exelDownload") exelDownload;
  public inicio: NgbDateStruct;
  public fin: NgbDateStruct;
  public cargando = false;
  public codigo = null;

  constructor(
    public api: ApiRequestService,
    public apiReport: ReportService,
    private toastr: ToastrService,
    public auth: AuthService
  ) { }

  ngOnInit() {
  }

  descargarReporte(nombre) {
    this.cargando = true;
    let params = {
      "codusu": this.auth.getUserName(),
      "report": nombre,
      "inicio": this.inicio ? new Date(this.inicio.year, this.inicio.month - 1, this.inicio.day) : null,
      "fin": this.fin ? new Date(this.fin.year, this.fin.month - 1, this.fin.day) : null
    }
    this.apiReport.post("reporte/generar", params)
      .then(
        data => {
          if (data) {
            this.descargarArchivoPDF('application/pdf', nombre + '.pdf', data);
          }
        }
      )
      .catch(err => this.handleError(err));
  }

  descargarArchivoPDF(tipoDocumento, nombreArchivo, data) {
    if (data) {
      var fileName = nombreArchivo;
      var file = new Blob([data._body], { type: tipoDocumento });
      var url = URL.createObjectURL(file);
      this.exelDownload.nativeElement.href = url;
      //this.exelDownload.nativeElement.download = fileName;
      this.exelDownload.nativeElement.target = "_blank";
      this.exelDownload.nativeElement.click();
      //this.toastr.success("Documento generado correctamente", "Exito");
      this.cargando = false;
    } else {
      //this.toastr.error('Error generando documento', 'Error');
      this.cargando = false;
    }
  }

  private handleError(error: any): void {
    this.cargando = false;
    console.log(error);
  }

  exportarCompras() {
    this.cargando = true;
    let parametros = {
      "usuario": this.auth.getUserName(),
      "desde": this.inicio ? new Date(this.inicio.year, this.inicio.month - 1, this.inicio.day) : null,
      "hasta": this.fin ? new Date(this.fin.year, this.fin.month - 1, this.fin.day) : null,
    };
    this.apiReport.post("compra/exportarCompras", parametros)
      .then(data => {
        if (data && data._body) {
          this.descargarArchivoExcel(data._body, 'Compras');
        } else {
          this.toastr.warning("Error al exportar compras");
        }
        this.cargando = false;
      }).catch(err => this.handleError(err));
  }

  exportarCompras2() {
    this.cargando = true;
    let parametros = {
      "usuario": this.auth.getUserName(),
      "seriecorrelativo": this.codigo
    };
    this.apiReport.post("compra/exportarCompras", parametros)
      .then(data => {
        if (data && data._body) {
          this.descargarArchivoExcel(data._body, 'ComprasPorCodigo');
        } else {
          this.toastr.warning("Error al exportar compras");
        }
        this.cargando = false;
      }).catch(err => this.handleError(err));
  }

  descargarArchivoExcel(data, nombreReporte) {
    var blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8" });
    var objectUrl = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = objectUrl;
    a.download = nombreReporte + ".xlsx";
    a.click();
    this.toastr.success("Reporte generado exitosamente.");
  }

}
