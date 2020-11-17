import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // I_URL: string = 'http://localhost/itrm_webservices/';//komal local
  // I_URL: string = 'http://13.232.190.178//itrm_webservices/';//komal local

  I_URL: string = 'https://dev.elogist.in/itrm_webservices/';
  B_URL: string = 'http://dev.elogist.in/booster_webservices/';
  T_URL: string = 'http://dev.elogist.in/transtrucknew/';

  // I_URL: string = 'https://elogist.in/itrm_webservices/';
  // B_URL: string = 'http://elogist.in/booster_webservices/';
  // T_URL: string = 'http://elogist.in/transtrucknew/';

  entryMode = this.user._loggedInBy == 'admin' ? '1' : '3';


  constructor(private http: HttpClient,
    public router: Router,
    public user: UserService) {
    console.log(this.user);
  }

  post(subURL: string, body: any, apiBase: string = 'I') {
    return this.http.post(this[apiBase + '_URL'] + subURL, body, { headers: this.setHeaders(apiBase) })
  }

  get(subURL: string, apiBase: string = 'I') {
    return this.http.get(this[apiBase + '_URL'] + subURL, { headers: this.setHeaders(apiBase) })
  }



  postBooster(subURL: string, body: any, apiBase: string = 'B') {
    return this.http.post(this[apiBase + '_URL'] + subURL, body, { headers: this.setHeaders(apiBase) })
  }

  getBooster(subURL: string, apiBase: string = 'B') {
    return this.http.get(this[apiBase + '_URL'] + subURL, { headers: this.setHeaders(apiBase) })
  }

  postTranstruck(subURL: string, body: any, apiBase: string = 'T') {
    return this.http.post(this[apiBase + '_URL'] + subURL, body, { headers: this.setHeaders(apiBase) })
  }

  getTranstruck(subURL: string, apiBase: string = 'T') {
    return this.http.get(this[apiBase + '_URL'] + subURL, { headers: this.setHeaders(apiBase) })
  }

  setHeaders(apiBase = 'I') {
    const authKeyType = {
      I: 'authkey',
      B: 'authkey_booster',
      T: 'authkey_gisdb'
    };

    const versions = {
      I: '1.0',
      B: '1.0',
      T: '2.9'
    };

    const authKey = this.user._details ? this.user._details[authKeyType[apiBase]] : '';
    const version = versions[apiBase];

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'version': version,
      'entrymode': this.user._loggedInBy == 'admin' ? '1' : '3',
      'apptype': 'dashboard',
      'authkey': authKey
    });
    return headers;
  }

}
