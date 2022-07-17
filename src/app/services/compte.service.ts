import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Compte } from '../models/Compte';

@Injectable({
  providedIn: 'root',
})
export class CompteService {
  constructor(private http: HttpClient) {}

  public createAccount(compte: Compte) {
    console.log(compte);
    return this.http.post<Compte>(`${environment.baseUrl}/comptes`, compte);
  }

  public getAllAccounts() {
    return this.http.get<any[]>(`${environment.baseUrl}/comptes`);
  }

  public getOneAccount(id: number) {
    return this.http.get<Compte>(`${environment.baseUrl}/comptes/${id}`);
  }

  public updateOneAccount(value: { id: number; compte: Compte }) {
    // console.log(value);
    return this.http.post<Compte>(
      `${environment.baseUrl}/comptes/${value.id}`,
      value
    );
  }

  public deleteAccount(id: number) {
    return this.http.delete<Compte>(`${environment.baseUrl}/comptes/${id}`);
  }
}
