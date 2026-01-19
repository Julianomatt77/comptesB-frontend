import {Injectable, inject, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
// import { Compte } from '../models/Compte';
import { Compte } from '../models/Compte';
import { tap } from 'rxjs/operators';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import {CompteV2} from "../models/compte.model";
import {StorageService} from "./storage.service";

@Injectable({
  providedIn: 'root',
})
export class CompteService {
  private http = inject(HttpClient);
  private readonly refreshTrigger = signal(0);
  private storageService = inject(StorageService);

  // Resource pour tous les comptes actifs
  readonly allAccounts = rxResource({
    params: this.refreshTrigger,
    stream: () =>
      this.http
        .get<CompteV2[]>(`${environment.baseUrl}/comptes/getAllAccounts`)
        .pipe(catchError(() => of([]))),
  });

  // Resource pour tous les comptes désactivés
  readonly deactivatedAccounts = rxResource({
    params: this.refreshTrigger,
    stream: () =>
      this.http
        .get<CompteV2[]>(`${environment.baseUrl}/comptes/getAllDeactivatedAccounts`)
        .pipe(catchError(() => of([]))),
  });

  // Méthode pour forcer le rechargement des données
  refresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }

  // Pour un compte spécifique, on peut utiliser une fonction qui retourne un resource
  // Pour un compte spécifique, on peut utiliser une fonction qui retourne un resource
  createAccountResource(idSignal: () => string | undefined) {
    return rxResource({
      params: idSignal,
      stream: ({ params: id }) => {
        if (!id) return of(null);
        return this.http
          .get<CompteV2>(`${environment.baseUrl}/comptes/getOneAccount/${id}`)
          .pipe(catchError(() => of(null)));
      },
    });
  }

  // Pour un compte par nom, même principe
  createAccountByNameResource(nameSignal: () => string, userIdSignal: () => string) {
    return rxResource({
      params: () => ({ name: nameSignal(), userId: userIdSignal() }),
      stream: ({ params }) =>
        this.http
          .get<Compte>(`${environment.baseUrl}/comptes/getOneAccountByName/${params.name}`)
          .pipe(catchError(() => of(null))),
    });
  }

  public createAccount(compte: CompteV2) {
    const userId = this.storageService.getUser()
    const data = {...compte, userId: userId}

    return this.http.post<CompteV2>(
      `${environment.baseUrl}/comptes/createAccount`,
      data
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

  public updateOneAccount(value: { id: string; compte: CompteV2 }) {
    return this.http.post<CompteV2>(
      `${environment.baseUrl}/comptes/updateOneAccount/${value.compte.id}`,
      value
    );
  }

  public deleteAccount(id: string) {
    return this.http.post<Compte>(
      `${environment.baseUrl}/comptes/deleteAccount/${id}`, {id: id}
    );
  }

  public updateSolde(name: string, solde: number) {
    return this.http.post<any>(
      `${environment.baseUrl}/comptes/updateSolde/${name}`,
      solde
    );
  }

  public getAllDeactivatedAccounts() {
    return this.http.get<any[]>(
      `${environment.baseUrl}/comptes/getAllDeactivatedAccounts`
    );
  }

  public reactivateAccount(id: string) {
    return this.http.post<Compte>(
      `${environment.baseUrl}/comptes/reactivateAccount/${id}`, {id: id}
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
