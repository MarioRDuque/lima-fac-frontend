export class Ventadet {
  id:number;
  cantidad:number=1;
  codproductosunat:string="";
  preciounitario:number=0.00;
  descuentounitario:number=0.00;
  descuentototal:number=0.00;
  igvitem:number=0.00;
  afectacionigv:string="20";
  iscitem:number=0.00;
  tiposistemaisc:string="01";
  valorunitariosinigv:number=0.00;
  preciototalsinigv:number=0.00;
  preciototal:number=0.00;
  estado:boolean=true;
  idproducto:any={};
  idventa:number;
  idunidadmedida:any={};
}
