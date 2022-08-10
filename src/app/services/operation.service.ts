import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Operation } from '../models/Operation';
import { tap } from 'rxjs/operators';
import { SoldeHistory } from '../interfaces/soldeHistory';
import { Recap } from '../interfaces/recap';
import { MatTableDataSource } from '@angular/material/table';

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
  public getEpargneHistory() {
    return this.http.get(`${environment.baseUrl}/operations/getEpargneHistory`);
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

  public getHistory(
    operationsYears: number[],
    monthlySoldeHistory: SoldeHistory[],
    initialSolde: number,
    soldeAllArray: any[]
  ) {
    let filteredArray2 = [];
    // console.log(operationsYears);

    operationsYears.forEach((operationyear) => {
      for (let i = 0; i < 12; i++) {
        let month: string;
        let montantPerMonth = 0;
        if (i < 9) {
          month = 0 + (i + 1).toString();
        } else {
          month = (i + 1).toString();
        }
        monthlySoldeHistory.push({
          dateSolde: operationyear + '-' + month,
          economie: 0,
          solde: initialSolde,
        });

        let operationMonth = operationyear + '-' + month;

        let monthIndex = monthlySoldeHistory.findIndex(
          (obj) => obj.dateSolde == operationMonth
        );

        filteredArray2 = [];
        filteredArray2 = soldeAllArray
          .filter((element) =>
            element.soldeHistory.some(
              (subElement: any) => subElement.soldeDate === operationMonth
            )
          )
          .map((element) => {
            let newElt = Object.assign({}, element); // copies element
            return newElt.soldeHistory.filter(
              (subElement: any) => subElement.soldeDate === operationMonth
            );
          });

        filteredArray2.forEach((monthOperation) => {
          montantPerMonth = 0;
          monthOperation.forEach((operation: any) => {
            montantPerMonth += operation.montant;
          });
        });

        monthlySoldeHistory[monthIndex].economie = montantPerMonth;
        if (monthIndex > 0) {
          monthlySoldeHistory[monthIndex].solde =
            monthlySoldeHistory[monthIndex - 1].solde + montantPerMonth;
        }
        // console.log(monthlySoldeHistory);
      }
    });
    // console.log(soldeAllArray);
    return monthlySoldeHistory;
  }
}
