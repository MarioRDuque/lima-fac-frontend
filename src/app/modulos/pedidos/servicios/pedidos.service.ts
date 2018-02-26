import { Injectable } from '@angular/core';

import { ApiRequestService } from '../../../servicios/api-request.service';

@Injectable()
export class PedidosService {

  constructor(private apiRequest: ApiRequestService) { }

  getLista(page:number, cantidad:number, bodyData:any): Promise<any> {
    return this.apiRequest.post('pedidos/pagina/'+page+'/cantidadPorPagina/'+cantidad, bodyData)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  obtener(id:number,ruta:string): Promise<any> {
    let bodyData = {
      "id": id,
    }
    return this.apiRequest.post(ruta, bodyData)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  guardar(evento: any): Promise<any> {
    return this.apiRequest.post('pedidos', evento)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  editar(evento: any): Promise<any> {
    return this.apiRequest.put('pedidos', evento)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  cerrar(id: number): Promise<any> {
    return this.apiRequest.post('pedidos/cerrar/'+id,null)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  eliminar(id: number): Promise<any> {
    return this.apiRequest.get('pedidos/eliminar/'+id)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  eliminarDetalle(id: number): Promise<any> {
    return this.apiRequest.get('pedidos/eliminardetalle/'+id)
      .then(
        jsonResp => {
          return jsonResp;
        }
      )
      .catch(err => this.handleError(err));
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
