import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response,
         Request, RequestOptions,
         URLSearchParams, RequestMethod
        } from '@angular/http';
import { Router } from '@angular/router';

import { AppConfig } from '../app-config';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';

export interface ObjetoJWT {
    userId:string;
    token:string;
}

@Injectable()
export class ApiRequestService {

    private headers: Headers;
    private requestOptions: RequestOptions;
    private usuarioActualKey: string = "currentUser";

    private almacenamiento: Storage = localStorage;
    private almacenamientoLocal: Storage = localStorage;

    constructor(
        private appConfig: AppConfig,
        private http: Http,
        private router: Router,
    ) { }

    appendAuthHeader(): Headers {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let objJWT: ObjetoJWT = JSON.parse(this.almacenamiento.getItem(this.usuarioActualKey));
        if (objJWT !== null){
            let token = objJWT.token;
            if (token !== null) {
               headers.append("Authorization", token);
            }
        }
        return headers;
    }

    getRequestOptions(requestMethod, url: string, urlParam?: URLSearchParams, body?: Object): RequestOptions {
        let options = new RequestOptions({
            headers: this.appendAuthHeader(),
            method: requestMethod,
            url: this.appConfig.baseApiPath + url
        });
        if (urlParam) {
            options = options.merge({ params: urlParam });
        }
        if (body) {
            options = options.merge({ body: JSON.stringify(body) });
        }
        return options;
    }

    get(url: string, urlParams?: URLSearchParams): Promise<any> {
        this.verificarNoGuardados();
        let requestOptions = this.getRequestOptions(RequestMethod.Get, url, urlParams);
        return this.http.request(new Request(requestOptions))
            .toPromise()
            .then(resp => resp.json())
            .catch(err => this.handleError(err));
    }

    post(url: string, body: Object): Promise<any> {
        this.verificarNoGuardados();
        let requestOptions = this.getRequestOptions(RequestMethod.Post, url, undefined, body);
        return this.http.request(new Request(requestOptions))
            .toPromise()
            .then(resp => resp.json())
            .catch(err => this.handleError(err));
    }

    postStorage(url: string, body: Object): Promise<any> {
      let requestOptions = this.getRequestOptions(RequestMethod.Post, url, undefined, body);
      return this.http.request(new Request(requestOptions))
        .toPromise()
        .then(resp => resp.json())
        .catch(err => this.handleError(err));
    }

    reporte(url: string, body: Object): Promise<any> {
      let requestOptions = this.getRequestOptions(RequestMethod.Post, url, undefined, body);
      return this.http.request(new Request(requestOptions))
        .toPromise()
        .then(resp => resp.json())
        .catch(err => this.handleError(err));
    }

    put(url: string, body: Object): Promise<any> {
        let requestOptions = this.getRequestOptions(RequestMethod.Put, url, undefined, body);
        return this.http.request(new Request(requestOptions))
            .toPromise()
            .then(resp => resp.json())
            .catch(err => this.handleError(err));
    }

    delete(url: string): Promise<any> {
        let requestOptions = this.getRequestOptions(RequestMethod.Delete, url);
        return this.http.request(new Request(requestOptions))
            .toPromise()
            .then(resp => resp.json())
            .catch(err => this.handleError(err));
    }

    verificarNoGuardados(){
      let noGuardados = JSON.parse(localStorage.getItem("pedidosSinGuardar"));
      if(noGuardados){
        for(var i = 0; i<noGuardados.length; i++){
          this.postStorage("pedidos",noGuardados[i])
            .then(
              jsonResp => {
                noGuardados.splice(noGuardados[i],1);
                localStorage.setItem("pedidosSinGuardar", JSON.stringify(noGuardados));
              }
            )
            .catch(err => this.errorAlIntentarGuardar(err));
        }
      }
      localStorage.setItem("pedidosSinGuardar", JSON.stringify(noGuardados));
    }

    errorAlIntentarGuardar(err){}

    handleError(error: any): Promise<any> {
      if (error.status === 401 || error.status === 403) {
          this.almacenamiento.clear();
          this.almacenamientoLocal.clear();
          this.router.navigate(['login']);
      }
      if(error.status === 404){
        console.error('página solicitada no se encuentra');
      }
      return Promise.reject(error.message || error);
    }
}
