export class Ventadet {
  id:number;
  cantidad:number=1;
  codproductosunat:string="";
  preciounitario:number=0;
  descuentounitario:number=0;
  descuentototal:number=0;
  igvitem:number=0;
  afectacionigv:number=0;
  iscitem:number=0;
  tiposistemaisc:string="01";
  valorunitariosinigv:number=0;
  preciototal:number=0;
  estado:boolean=true;
  idproducto:any={};
  idventa:number;
  idunidadmedida:any={};
}
