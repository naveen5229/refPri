import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  _token = '';
  _details = null;

  constructor() {
    this._token = localStorage.getItem('USER_TOKEN') || '';
    this._details = JSON.parse(localStorage.getItem('USER_DETAILS')) || null;   
  }
}