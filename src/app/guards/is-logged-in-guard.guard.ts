import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
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
    if (this.cookieService.check('compty-auth-tok') === true) {
      return true;
    } else {
      window.alert("Vous n'avez pas accès à cette page");
      return false;
    }
  }
}
