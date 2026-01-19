import { Injectable, inject, signal, computed } from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import {User} from "../models/user.model";
import {StorageService} from "./storage.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);
  private storageService = inject(StorageService);

  private baseUrl = environment.baseUrl;

  private _isAuthenticated = signal(false);
  public isAuthenticated = this._isAuthenticated.asReadonly();

  private _currentUser = signal<User>({} as User);
  public currentUser = this._currentUser.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = computed(() => this._loading());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  initFromCookies(): void {
    const hasToken = this.cookieService.check('compty-auth-tok');
    this._isAuthenticated.set(this.storageService.isLoggedIn());
  }

  async login(username: string, password?: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const data: any = await firstValueFrom(this.http.post<any>(
        `${this.baseUrl}/auth/login`,
        {
              username,
              password,
            }
      ));
      if (data) {
        this._isAuthenticated.set(true);
        // this.storageService.saveUser(data);
        this._currentUser.set(data);

        this.cookieService.set(
          'compty-auth-tok',
          data.token,
          0.2,
          '/',
          undefined,
          false,
          'Strict'
        );
        this.cookieService.set(
          'compty-userId',
          data.userId,
          0.2,
          '/',
          undefined,
          false,
          'Strict'
        );
      }
    } catch (err: any) {
      console.error(err)
      this._error.set(err.error.message)
    } finally {
      this._loading.set(false);
    }

  }

  register(username: string, email: string, password: string): Observable<any> {
    this._isAuthenticated.set(false);
    return this.http.post(environment.baseUrl + '/auth/signup', {
      username,
      email,
      password,
    });
  }

  logout(): Observable<any> {
    this.cookieService.deleteAll('/');
    // this.storageService.clean();
    this._isAuthenticated.set(false);
    this._currentUser.set({} as User);
    this.router.navigateByUrl('/');
    return this.http.post(environment.baseUrl + '/auth/signout', {});
  }
}
