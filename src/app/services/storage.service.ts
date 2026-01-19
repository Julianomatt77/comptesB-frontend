import {inject, Injectable, signal} from '@angular/core';
import {CookieService} from "ngx-cookie-service";

const USER_KEY = 'compty-auth-user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private cookieService = inject(CookieService);
  userId = signal("")

  clean(): void {
    window.sessionStorage.clear();
  }

  // public saveUser(user: any): void {
  //   window.sessionStorage.removeItem(USER_KEY);
  //   window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  // }

  public getUser(): any {
    if (this.cookieService.check('compty-auth-tok')) {
      this.userId.set(this.cookieService.get('compty-auth-tok'))
      return this.userId();
    }

    return null;

    // const user = window.sessionStorage.getItem(USER_KEY);
    // if (user) {
    //   console.log(JSON.parse(user))
    //   return JSON.parse(user);
    // }

    // return {};
  }

  public isLoggedIn(): boolean {
    if (this.cookieService.check('compty-userId')) {
      this.userId.set(this.cookieService.get('compty-userId'))
      return true;
    }

    // const user = window.sessionStorage.getItem(USER_KEY);
    // if (user) {
    //   return true;
    // }

    return false;
  }
}
