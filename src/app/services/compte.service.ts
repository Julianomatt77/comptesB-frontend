import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Compte } from '../models/Compte';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CompteService {
  constructor(private http: HttpClient) {}

  public createAccount(compte: Compte) {
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
  public getOneAccountByName(name: string, userId:string) {
    return this.http.get<Compte>(
      `${environment.baseUrl}/comptes/getOneAccountByName/${name}`
    );
  }

  public updateOneAccount(value: { id: string; compte: Compte }) {
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

  public getCompteList(compteList: any[], userId: string) {
    let compteListObservable = this.getAllAccounts().pipe(
      tap((data) => {
        data.forEach((compte) => {
          if (compte.userId == userId) {
            compte.soldeActuel = Math.round(compte.soldeActuel * 100) / 100;
            compteList.push(compte);
          }
        });
      })
    );

    return compteListObservable;
  }

  public sortCompteListByType(compteList: any[])  {
    compteList.sort((a: any, b: any) => {
      if (a.typeCompte === 'Compte Courant' && b.typeCompte !== 'Compte Courant') {
        return -1;
      } else if (a.typeCompte !== 'Compte Courant' && b.typeCompte === 'Compte Courant') {
        return 1;
      } else if (a.typeCompte < b.typeCompte) {
        return -1;
      } else if (a.typeCompte > b.typeCompte) {
        return 1;
      } else {
        return 0;
      }
    });

    return compteList;
  }

  public groupComptesByType(compteList: any[]): { [key: string]: any[] } {
    return compteList.reduce((groups, compte) => {
      const type = compte.typeCompte;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(compte);
      return groups;
    }, {} as { [key: string]: any[] });
  }
}
