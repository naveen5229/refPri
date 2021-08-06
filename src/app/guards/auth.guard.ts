import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../Service/user/user.service';
import { CommonService } from '../Service/common/common.service';
import { ActivityService } from '../Service/Acivity/activity.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {

  constructor(public user: UserService,
    public common: CommonService,
    private router: Router,
    public activity:ActivityService) {
  }

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log('Next', next);
    console.log('State', state);
    if (!this.user._token) {
      this.router.navigate(['/auth/login']);
      return false;
    } else {
      this.activity.routerDetection(state.url);
      return true;
    }
  }
  
}
