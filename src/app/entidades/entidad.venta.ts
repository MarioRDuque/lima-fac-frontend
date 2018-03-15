import {Ventadet} from "./entidad.ventadet";
export class Venta {
  id:number;
  serie:string;
  correlativo:string;
  rucempresa:string;
  tipooperacion:string;
  fechaemision:Date;
  domfiscal:string='001';
  idtipodocumento:any={};
  doccliente:string;
  nombrecliente:string;
  idmoneda:any={};
  descglobal:number=0;
  sumcargos:number=0;
  totaldesc:number;
  totalsinigv:number;
  igv:number;
  valoropeinaf:number=0;
  valopeexo:number=0;
  isc:number=0;
  sumaotrostrib:number=0;
  estado:boolean=true;
  usuariosave:string;
  usuarioupdate:string;
  ventadetList: Ventadet[] =[];
}
