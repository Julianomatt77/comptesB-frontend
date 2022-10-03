import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OpCommune } from '../models/OpCommune';
import { tap } from 'rxjs/operators';
import { OpCommuneUser } from '../models/OpCommuneUser';

@Injectable({
  providedIn: 'root',
})
export class OpCommunesService {
  constructor(private http: HttpClient) {}

  public createOperation(operation: OpCommune) {
    return this.http.post<OpCommune>(
      `${environment.baseUrl}/opCommunes/createOperation`,
      operation
    );
  }

  public getAllOperations() {
    return this.http.get<any[]>(
      `${environment.baseUrl}/opCommunes/getAllOperations`
    );
  }

  public getOperationsFiltered(month: string, year: string) {
    return this.http.post<any[]>(
      `${environment.baseUrl}/opCommunes/getOperationsFiltered`,
      { month, year }
    );
  }

  public getOneOperation(id: string) {
    return this.http.get<OpCommune>(
      `${environment.baseUrl}/opCommunes/getOneOperation/${id}`
    );
  }

  public updateOneOperation(value: { id: string; operation: OpCommune }) {
    return this.http.post<OpCommune>(
      `${environment.baseUrl}/opCommunes/updateOneOperation/${value.id}`,
      value
    );
  }

  public deleteOperation(id: string) {
    return this.http.delete<OpCommune>(
      `${environment.baseUrl}/opCommunes/deleteOperation/${id}`
    );
  }

  public getOperations(operationList: any[], userId: string) {
    operationList = [];
    let operationsObservable = this.getAllOperations().pipe(
      tap((data) => {
        data.forEach((operation) => {
          if (operation.userId == userId) {
            operationList.unshift(operation);
          }
        });
      })
    );
    // console.log(operationsObservable);
    // console.log(operationList);
    return operationsObservable;
  }

  /****************** USERS ********************** */

  public createUser(user: OpCommuneUser) {
    // console.log(user);
    return this.http.post<OpCommuneUser>(
      `${environment.baseUrl}/opCommunes/createUser`,
      user
    );
  }

  public getAllUsers() {
    return this.http.get<any[]>(
      `${environment.baseUrl}/opCommunes/getAllUsers`
    );
  }

  public getOneUser(id: string) {
    return this.http.get<OpCommuneUser>(
      `${environment.baseUrl}/opCommunes/getOneUser/${id}`
    );
  }

  public getOneUserByName(name: string) {
    return this.http.get<OpCommuneUser>(
      `${environment.baseUrl}/opCommunes/getOneUserByName/${name}`
    );
  }

  public updateOneUser(value: { id: string; user: OpCommuneUser }) {
    return this.http.post<OpCommuneUser>(
      `${environment.baseUrl}/opCommunes/updateOneUser/${value.id}`,
      value
    );
  }

  public deleteUser(id: string) {
    return this.http.delete<OpCommuneUser>(
      `${environment.baseUrl}/opCommunes/deleteUser/${id}`
    );
  }
}
