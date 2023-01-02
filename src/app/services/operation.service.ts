import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Operation } from '../models/Operation';
import { tap } from 'rxjs/operators';
import { SoldeHistory } from '../interfaces/soldeHistory';
import { Recap } from '../interfaces/recap';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { CompteService } from './compte.service';

@Injectable({
  providedIn: 'root',
})
export class OperationService {
  constructor(private http: HttpClient, private compteService: CompteService) {}

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

  public getOperationHistory(
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
        let montantInvestiPerMonth = 0;
        if (i < 9) {
          month = 0 + (i + 1).toString();
        } else {
          month = (i + 1).toString();
        }

        // Initialisation du tableau monthlySoldeHistory
        monthlySoldeHistory.push({
          dateSolde: operationyear + '-' + month,
          montantInvesti: 0,
          economie: 0,
          solde: initialSolde,
        });
        // console.log(monthlySoldeHistory);

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

        // console.log(filteredArray2);

        filteredArray2.forEach((monthOperation) => {
          montantPerMonth = 0;
          montantInvestiPerMonth = 0;
          monthOperation.forEach((operation: any) => {
            montantPerMonth += operation.montant;
            montantInvestiPerMonth += operation.montantInvesti;
          });

          monthlySoldeHistory[monthIndex].economie += montantPerMonth;
          monthlySoldeHistory[monthIndex].montantInvesti +=
            montantInvestiPerMonth;
        });

        // console.log(monthlySoldeHistory);

        if (monthIndex > 0) {
          monthlySoldeHistory[monthIndex].solde =
            monthlySoldeHistory[monthIndex - 1].solde +
            monthlySoldeHistory[monthIndex].economie;
        }
      }
    });
    // console.log(soldeAllArray);
    // console.log(monthlySoldeHistory);
    return monthlySoldeHistory;
  }

  public fillSoldeAllAccounts(
    data: any[],
    compteType: string,
    soldeAllArray: any[],
    userId: string
  ) {
    data.forEach((compte) => {
      if (compte.typeCompte == compteType && compte.userId == userId) {
        soldeAllArray.push({
          compteId: compte._id,
          compteName: compte.name,
          soldeInitial: compte.soldeInitial,
          soldeHistory: [],
          lastSolde: compte.soldeInitial,
        });
      }
    });
    return soldeAllArray;
  }

  public fillOperations(data: any[], soldeAllArray: any[], userId: string) {
    let operations = data.reverse();
    operations.forEach((operation) => {
      let operationDate =
        operation.operationDate.split('-')[0] +
        '-' +
        operation.operationDate.split('-')[1];

      soldeAllArray.forEach((compte) => {
        if (
          ((operation.compte == compte.compteName) || (operation.compte == compte.compteId)) &&
          operation.userId == userId
        ) {
          let montantInvesti = 0;
          if (operation.montant > 0 && operation.categorie == 'Transfert') {
            montantInvesti = operation.montant;
          }

          compte.lastSolde = compte.lastSolde + operation.montant;
          compte.soldeHistory.push({
            soldeDate: operationDate,
            montantInvesti: montantInvesti,
            montant: operation.montant,
            solde: compte.lastSolde,
          });
        }
      });
    });
  }

  public exportToCSV(array: any[], filename: string) {
    var csvData = this.ConvertToCSV(array);
    var a = document.createElement('a');

    // Pour encodage avec accents
    var BOM = '\uFEFF';
    csvData = BOM + csvData;

    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
  }

  public ConvertToCSV(objArray: any[]) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var row = '';

    for (var index in objArray[0]) {
      //Now convert each value to string and comma-separated
      row += index + ',';
    }
    row = row.slice(0, -1);
    //append Label row with line break
    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ',';

        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }
}
