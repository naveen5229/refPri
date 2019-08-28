import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  URL:string='http://192.168.0.111/itrm_webservices/';//vishal local

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
      'entrymode': '3',
      'apptype': 'dashboard',
      'authkey': this.user._token || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwibmFtZSI6InZpc2hhbCIsIm1vYmlsZW5vIjoiODIzMzM3MTkzNCIsImVtYWlsIjoidmlzaGFsLmd1cmRhc2FuaUBlbG9naXN0LmluIiwidGltZSI6IjIwMTktMDgtMjZUMTE6MDI6MzIrMDA6MDAifQ.dUHoP3WpjpIyt6yvRZc5Va9OeN--0xgKWis5WQQJHiw'
    });
    return headers;
  }
 

}
