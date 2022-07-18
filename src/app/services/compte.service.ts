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
    return this.http.post<Compte>(
      `${environment.baseUrl}/comptes/createAccount`,
      compte
    );
  }

  public getAllAccounts() {
    return this.http.get<any[]>(
      `${environment.baseUrl}/comptes/getAllAccounts`
    );
  }

  public getOneAccount(id: string) {
    return this.http.get<Compte>(
      `${environment.baseUrl}/comptes/getOneAccount/${id}`
    );
  }
  public getOneAccountByName(name: string) {
    return this.http.get<Compte>(
      `${environment.baseUrl}/comptes/getOneAccountByName/${name}`
    );
  }

  public updateOneAccount(value: { id: string; compte: Compte }) {
    // console.log(value);
    return this.http.post<Compte>(
      `${environment.baseUrl}/comptes/updateOneAccount/${value.id}`,
      value
    );
  }

  public deleteAccount(id: string) {
    return this.http.delete<Compte>(
      `${environment.baseUrl}/comptes/deleteAccount/${id}`
    );
  }

  public updateSolde(name: string, solde: number) {
    return this.http.post<any>(
      `${environment.baseUrl}/comptes/updateSolde/${name}`,
      solde
    );
  }
}
