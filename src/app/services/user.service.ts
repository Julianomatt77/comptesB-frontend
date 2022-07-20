import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// const API_URL = 'http://localhost:8080/api/test/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getPublicContent(): Observable<any> {
    return this.http.get(environment.baseUrl + '/all', {
      responseType: 'text',
    });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(environment.baseUrl + '/user', {
      responseType: 'text',
    });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(environment.baseUrl + '/mod', {
      responseType: 'text',
    });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(environment.baseUrl + '/admin', {
      responseType: 'text',
    });
  }
}
