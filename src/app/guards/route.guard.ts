import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanDeactivate } from '@angular/router';

//import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../Service/user/user.service';
import { CommonService } from '../Service/common/common.service';


@Injectable({
  providedIn: 'root'
})

export class RouteGuard implements CanActivate {
  constructor(public user: UserService,
    public common: CommonService,
    private router: Router) {
  }
  url = null;

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.url = state.url;
    return this.checkRouteAccessPermission(state.url);
  }

  checkRouteAccessPermission(route) {
    // console.log(this.user._pages);
    let status = false;
    this.user._pages.map(page => {

      if (page.route == route && page.isSelected) {
        status = true;
        this.user.permission = {
          add: page.isadd,
          edit: page.isedit,
          delete: page.isdeleted,
        };
      }
    });
    if (!status) {
        this.common.showError('Permission Denied');
    } 
    return status;
  }
}
  export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
  }
  
  @Injectable()
  export class DeactivateGuardService implements CanDeactivate<CanComponentDeactivate>{
  
    canDeactivate(component: CanComponentDeactivate,
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot) {
  
      let url: string = state.url;
  
      return component.canDeactivate ? component.canDeactivate() : true;
    }
}
