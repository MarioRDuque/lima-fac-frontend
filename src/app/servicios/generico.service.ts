import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { ApiRequestService } from './api-request.service';

const MENSAJE = 'No se esta retornando una lista para la solicitud ';

@Injectable()
export class GenericoService<T> {

	constructor(private apiRequest: ApiRequestService) { }

	getLista(urlApi: string): Promise<T[]>{
		return this.apiRequest.get(urlApi, null)
		.then( 
			jsonResp => {
				if (jsonResp !== undefined && jsonResp.estadoOperacion === 'EXITO') {
					jsonResp = jsonResp.extraInfo as T[];
				} else{
					console.info(MENSAJE+urlApi, jsonResp);
					jsonResp = undefined;
				}   
				return jsonResp;        
			}
			)
		.catch(err => this.handleError(err,urlApi)); 
	}

	getListaParams(urlApi: string, params: URLSearchParams): Promise<T[]>{
		return this.apiRequest.get(urlApi, params)
		.then( 
			jsonResp => {
				if (jsonResp !== undefined && jsonResp.estadoOperacion === 'EXITO') {
					jsonResp = jsonResp.extraInfo as T[];
				} else{
					console.info(MENSAJE+urlApi, jsonResp);
					jsonResp = undefined;
				}   
				return jsonResp;        
			}
			)
		.catch(err => this.handleError(err,urlApi)); 
	}

	private handleError(error: any, urlApi): Promise<any> {
		console.error('Ocurrio un error solicitando '+urlApi, error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
