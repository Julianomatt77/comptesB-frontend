import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Operation } from '../models/Operation';

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

  public getOneOperation(id: string) {
    return this.http.get<Operation>(
      `${environment.baseUrl}/operations/getOneOperation/${id}`
    );
  }

  public updateOneOperation(value: { id: string; operation: Operation }) {
    console.log(value);
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
}
