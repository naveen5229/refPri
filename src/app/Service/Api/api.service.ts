import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  URL:string='http://192.168.0.111/itrm_webservices/';

  constructor(private http: HttpClient,
    public router: Router,
    public user: UserService) {
     }

  post(subURL: string, body: any, options?) {
    return this.http.post(this.URL + subURL, body, { headers: this.setHeaders() })
  }

  get(subURL: string, params?: any) {
    return this.http.get(this.URL + subURL, { headers: this.setHeaders() })
  }

  setHeaders() {
    const entryMode = '3';
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'version': '1.0',
      'entrymode': entryMode,
      'apptype': 'dashboard',
      'authkey': this.user._token || ''
    });
    return headers;
  }
 

}
