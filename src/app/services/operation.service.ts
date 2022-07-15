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
      `${environment.baseUrl}/operations`,
      operation
    );
  }

  public getAllOperations() {
    return this.http.get<any[]>(`${environment.baseUrl}/operations`);
  }

  public getOneOperation(id: number) {
    return this.http.get<Operation>(`${environment.baseUrl}/operations/${id}`);
  }

  public updateOneOperation(value: { id: number; operation: Operation }) {
    console.log(value);
    return this.http.post<Operation>(
      `${environment.baseUrl}/operations/${value.id}`,
      value
    );
  }

  public deleteOperation(id: number) {
    return this.http.delete<Operation>(
      `${environment.baseUrl}/operations/${id}`
    );
  }
}
