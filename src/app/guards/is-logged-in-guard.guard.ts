import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { mergeMap, Observable } from 'rxjs';
import { User } from '../models/User';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class IsLoggedInGuardGuard  {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // return this.authService.currentUserSubject.pipe(
    //   mergeMap((user : User) => {
    //     if (user && user.token) {
    //       return of(true)
    //     }
    //   })
    // )
    if (this.cookieService.check('auth-user') === true) {
      const token = this.cookieService.get('auth-user');
      const username = this.cookieService.get('username');
      const userId = this.cookieService.get('userId');
      return true;
    } else {
      window.alert("Vous n'avez pas accès à cette page");
      return false;
    }

    // return this.router.navigate('');
  }
}
