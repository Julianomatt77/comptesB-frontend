import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';
import { map } from 'rxjs/operators';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
// };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public currentUserSubject = new BehaviorSubject<any>(undefined);

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  login(username: string, password?: string): Observable<any> {
    this.isAuthenticatedSubject.next(true);
    return this.http.post(environment.baseUrl + '/auth/login', {
      username,
      password,
    });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(environment.baseUrl + '/auth/signup', {
      username,
      email,
      password,
    });
  }

  logout(): Observable<any> {
    this.cookieService.deleteAll('/');
    this.router.navigateByUrl('/');
    // this.currentUserSubject.next(new User);
    return this.http.post(environment.baseUrl + '/auth/signout', {});
  }
}
