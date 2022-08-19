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

  // getPublicContent(): Observable<any> {
  //   return this.http.get(environment.baseUrl + '/all', {
  //     responseType: 'text',
  //   });
  // }

  // getUserBoard(): Observable<any> {
  //   return this.http.get(environment.baseUrl + '/user', {
  //     responseType: 'text',
  //   });
  // }

  // getModeratorBoard(): Observable<any> {
  //   return this.http.get(environment.baseUrl + '/mod', {
  //     responseType: 'text',
  //   });
  // }

  // getAdminBoard(): Observable<any> {
  //   return this.http.get(environment.baseUrl + '/admin', {
  //     responseType: 'text',
  //   });
  // }

  public getOneUser(id: string) {
    return this.http.get<any>(`${environment.baseUrl}/auth/getOneUser/${id}`);
  }

  public updateOneUser(value: { id: string; user: any }) {
    return this.http.post<any>(
      `${environment.baseUrl}/auth/updateOneUser/${value.id}`,
      value
    );
  }

  public deleteUser(id: string) {
    return this.http.delete<any>(
      `${environment.baseUrl}/auth/deleteUser/${id}`
    );
  }
}
