import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Operation } from '../models/Operation';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OperationService {
  constructor(private http: HttpClient) {}

  public createOperation(operation: Operation) {
    return this.http.post<Operation>(
      `${environment.baseUrl}/operations/createOperation`,
      operation
    );
  }

  public getAllOperations() {
    return this.http.get<any[]>(
      `${environment.baseUrl}/operations/getAllOperations`
    );
  }

  public getOperationsFiltered(month: string, year: string) {
    return this.http.post<any[]>(
      `${environment.baseUrl}/operations/getOperationsFiltered`,
      { month, year }
    );
  }

  public getOneOperation(id: string) {
    return this.http.get<Operation>(
      `${environment.baseUrl}/operations/getOneOperation/${id}`
    );
  }

  public updateOneOperation(value: { id: string; operation: Operation }) {
    return this.http.post<Operation>(
      `${environment.baseUrl}/operations/updateOneOperation/${value.id}`,
      value
    );
  }

  public deleteOperation(id: string) {
    return this.http.delete<Operation>(
      `${environment.baseUrl}/operations/deleteOperation/${id}`
    );
  }

  public uploadAccountHistory(soldeAllArray: any[], type: string) {
    return this.http.post<any[]>(
      `${environment.baseUrl}/operations/uploadAccountHistory`,
      { soldeAllArray, type }
    );
  }

  public getAccountHistory() {
    return this.http.get(`${environment.baseUrl}/operations/getAccountHistory`);
  }

  public getOperations(operationList: any[], userId: string) {
    let operationsObservable = this.getAllOperations().pipe(
      tap((data) => {
        data.forEach((operation) => {
          // console.log(operation.categorie);
          if (operation.userId == userId) {
            operationList.unshift(operation);
          }
        });
      })
    );
    // console.log(operationsObservable);
    return operationsObservable;
  }
}
