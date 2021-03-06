import {Ventadet} from "./entidad.ventadet";
export class Venta {
  id:number;
  serie:string;
  correlativo:number;
  rucempresa:string;
  tipooperacion:string;
  fechaemision:Date;
  domfiscal:string='001';
  idtipodocumento:any={};
  doccliente:string;
  nombrecliente:string;
  idmoneda:any={};
  descglobal:number=0.00;
  sumcargos:number=0.00;
  totaldesc:number=0.00;
  totalsinigv:number=0.00;
  igv:number=0.00;
  valoropeinaf:number=0.00;
  valopeexo:number=0.00;
  isc:number=0.00;
  sumaotrostrib:number=0.00;
  estado:boolean=true;
  usuariosave:string;
  usuarioupdate:string;
  descripcion:string;
  anulado:string;
  importetotal:number=0.00;
  ventadetList: Ventadet[] =[];
}
