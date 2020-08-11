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

  _menu = {
    pages: []
  };

  _loggedInBy = '';
  _pages = [];

  constructor() {
    this._token = localStorage.getItem('ITRM_USER_TOKEN') || '';
    this._details = JSON.parse(localStorage.getItem('ITRM_USER_DETAILS'));
    this._loggedInBy = localStorage.getItem('ITRM_LOGGED_IN_BY') || '';

    if (localStorage.getItem("ITRM_USER_PAGES")) {
      this._pages = JSON.parse(localStorage.getItem("ITRM_USER_PAGES"));
      this.filterMenu("pages", "pages");
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
  }

  clearStorage() {
    localStorage.removeItem('ITRM_USER_TOKEN');
    localStorage.removeItem('ITRM_USER_DETAILS');
    localStorage.removeItem('ITRM_LOGGED_IN_BY');
    localStorage.removeItem('ITRM_USER_PAGES');
  }



}