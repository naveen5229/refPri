import { Injectable } from '@angular/core';
import { MENU_ITEMS } from '../../pages/pages-menu';


const COLLECTION = {
  pages: MENU_ITEMS,
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  _token = '';
  _details = null;
  _fouser = null;

  _menu = {
    pages: []
  };

  _loggedInBy = '';
  _pages = [];
  loggedInUser = {id: null, name: null};

  constructor() {
    this._token = localStorage.getItem('ITRM_USER_TOKEN') || '';
    this._details = JSON.parse(localStorage.getItem('ITRM_USER_DETAILS'));
    this._loggedInBy = localStorage.getItem('ITRM_LOGGED_IN_BY') || '';
    if (localStorage.getItem("ITRM_USER_PAGES")) {
      this._pages = JSON.parse(localStorage.getItem("ITRM_USER_PAGES"));
      this.filterMenu("pages", "pages");
    }
    if(localStorage.getItem('FO_USER_DETAILS')){
      this._fouser = JSON.parse(localStorage.getItem('FO_USER_DETAILS'));
    }
    if(this._fouser || this._details){
      this.loggedInUser.id = (this._fouser && this._fouser.id>0) ? this._fouser.id : this._details.id;
      this.loggedInUser.name = (this._fouser && this._fouser.id>0) ? this._fouser.name : this._details.name;
    }

    if (this._token && !this._loggedInBy) {
      this.reset();
      this.clearStorage();
    }
  }

  permission = {
    add: false,
    edit: false,
    delete: false,
  };

  
  filterMenu(type?, collection?) {
    this._menu[type] = JSON.parse(COLLECTION[collection])
      .map((menuItem) => {
        if (menuItem.children) {
          menuItem.children = menuItem.children.filter(childItem => {
            if (this._pages.find(page => {
              if (childItem.link == page.route && page.isSelected) { return true; }
              return false;
            }))
              return true;
            return false;
          });
        }
        return menuItem;
      })
      .filter(menuItem => {
        if (menuItem.link) {
          if (this._pages.find(page => {
            if (menuItem.link == page.route && page.isSelected) return true;
            return false;
          }))
            return true;
          return false;
        } else if (!menuItem.children.length) return false;
        return true;
      });

    if (this._loggedInBy === 'admin') {
      this._menu[type].push({
        title: "Walle8",
        icon: 'layers-outline',
      });
    }
  }

  reset() {
    this._token = '';
    this._details = null;
    this._menu = {
      pages: []
    };
    this._loggedInBy = '';
    this._pages = [];
    this._fouser = null;
    this.loggedInUser = {id: null, name: null};
  }

  clearStorage() {
    localStorage.removeItem('ITRM_USER_TOKEN');
    localStorage.removeItem('ITRM_USER_DETAILS');
    localStorage.removeItem('ITRM_LOGGED_IN_BY');
    localStorage.removeItem('ITRM_USER_PAGES');
    localStorage.removeItem('FO_USER_DETAILS');
    localStorage.removeItem('LANDING_PAGE');
  }



}