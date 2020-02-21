import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL: string = 'http://192.168.1.100/itrm_webservices/';//komal local
  URL: string = 'https://dev.elogist.in/itrm_webservices/'

  URLBooster: string = 'http://dev.elogist.in/booster_webservices/';


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
    const entryMode = '1';
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'version': '1.0',
      'entrymode': '1',
      'apptype': 'dashboard',
      'authkey': this.user._token
    });
    return headers;
  }

  postBooster(subURL: string, body: any, options?) {
    return this.http.post(this.URLBooster + subURL, body, { headers: this.setHeadersBooster() })
  }

  getBooster(subURL: string, params?: any) {
    return this.http.get(this.URLBooster + subURL, { headers: this.setHeadersBooster() })
  }

  setHeadersBooster() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'version': '1.0',
      'entrymode': '2',
      'apptype': 'dashboard',
      'authkey': this.user._details.authkey_booster
    });
    return headers;
  }


}
