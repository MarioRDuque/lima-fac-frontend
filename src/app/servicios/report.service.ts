import { Injectable } from '@angular/core';
import { Http, Headers,
         Request, RequestOptions,
         URLSearchParams, RequestMethod,
         ResponseContentType
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
export class ReportService {

  	private headers: Headers;
    private requestOptions: RequestOptions;
    private usuarioActualKey: string = "currentUser";
    private almacenamiento: Storage = localStorage;
    private almacenamientoLocal: Storage = localStorage;
    private responseContentType: ResponseContentType;
    constructor(
        private appConfig: AppConfig,
        private http: Http,
        private router: Router
    ) {
    	this.responseContentType = ResponseContentType.ArrayBuffer;
    }

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
            url: this.appConfig.baseApiPath + url,
            responseType: this.responseContentType
        });
        if (urlParam) {
            options = options.merge({ params: urlParam });
        }
        if (body) {
            options = options.merge({ body: JSON.stringify(body) });
        }
        return options;
    }

    post(url: string, body: Object): Promise<any> {
        let requestOptions = this.getRequestOptions(RequestMethod.Post, url, undefined, body);
        return this.http.request(new Request(requestOptions))
            .toPromise()
            .catch(err => this.handleError(err));
    }

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
