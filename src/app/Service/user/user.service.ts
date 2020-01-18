import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  _token = '';
  _details = null;

  constructor() {
    this._token = localStorage.getItem('ITRM_USER_TOKEN') || '';
    console.log(this._token);
    this._details = JSON.parse(localStorage.getItem('ITRM_USER_DETAILS'));   
  }
}