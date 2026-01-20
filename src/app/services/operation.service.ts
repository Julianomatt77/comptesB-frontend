import {Injectable, inject, signal, computed} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Operation } from '../models/Operation';
import { tap } from 'rxjs/operators';
import { SoldeHistory } from '../interfaces/soldeHistory';
import { Recap } from '../interfaces/recap';
import {firstValueFrom, forkJoin} from 'rxjs';
import { CompteService } from './compte.service';
import {OperationV2} from "../models/operation.model";

@Injectable({
  providedIn: 'root',
})
export class OperationService {
  private http = inject(HttpClient);
  private compteService = inject(CompteService);

  readonly operations = signal<OperationV2[]>([]);
  readonly operationsLoading = signal(false);
  readonly operationsError = signal<string | null>(null);

  readonly currentOperation = signal<OperationV2 | null>(null);
  readonly currentOperationLoading = signal(false);
  readonly currentOperationError = signal<string | null>(null);

  readonly operationYears = computed(() => {
    const ops = this.operations();
    if (ops.length === 0) return [new Date().getFullYear()];

    const years = new Set<number>();
    ops.forEach(op => {
      const year = new Date(op.operationDate).getFullYear();
      years.add(year);
    });

    return Array.from(years).sort((a, b) => a - b);
  });

  async loadAllOperations(userId?: number): Promise<void> {
    this.operationsLoading.set(true);
    this.operationsError.set(null);

    try {
      const data = await firstValueFrom(
        this.http.get<OperationV2[]>(`${environment.baseUrl}/operations/getAllOperations`)
      );

      let filtered = data || [];

      if (userId) {
        filtered = filtered.filter(op => op.userId === userId);
      }

      // Sort by date descending (most recent first)
      filtered.sort((a, b) =>
        new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime()
      );

      this.operations.set(filtered);
    } catch (error: any) {
      this.operationsError.set(error?.message || 'Erreur lors du chargement des opérations');
      console.error('Error loading operations:', error);
    } finally {
      this.operationsLoading.set(false);
    }
  }

  // Load filtered operations
  async loadOperationsFiltered(month: string, year: string, userId?: number): Promise<void> {
    this.operationsLoading.set(true);
    this.operationsError.set(null);

    try {
      const data = await firstValueFrom(
        this.http.post<OperationV2[]>(
          `${environment.baseUrl}/operations/getOperationsFiltered`,
          { month, year }
        )
      );

      let filtered = data || [];

      if (userId) {
        filtered = filtered.filter(op => op.userId === userId);
      }

      // Sort by date descending
      filtered.sort((a, b) =>
        new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime()
      );

      this.operations.set(filtered);
    } catch (error: any) {
      this.operationsError.set(error?.message || 'Erreur lors du chargement des opérations filtrées');
      console.error('Error loading filtered operations:', error);
    } finally {
      this.operationsLoading.set(false);
    }
  }

  // Get one operation
  async loadOperation(id: number): Promise<void> {
    this.currentOperationLoading.set(true);
    this.currentOperationError.set(null);

    try {
      const operation = await firstValueFrom(
        this.http.get<OperationV2>(`${environment.baseUrl}/operations/getOneOperation/${id}`)
      );

      this.currentOperation.set(operation || null);
    } catch (error: any) {
      this.currentOperationError.set(error?.message || 'Erreur lors du chargement de l\'opération');
      console.error('Error loading operation:', error);
      this.currentOperation.set(null);
    } finally {
      this.currentOperationLoading.set(false);
    }
  }

  // Create operation
  async createOperation(operation: Omit<OperationV2, 'id'>, userId?: number): Promise<OperationV2 | null> {
    try {
      const created = await firstValueFrom(
        this.http.post<OperationV2>(
          `${environment.baseUrl}/operations/createOperation`,
          operation
        )
      );

      if (created && userId) {
        // Refresh operations list
        await this.loadAllOperations(userId);
      }

      return created || null;
    } catch (error) {
      console.error('Error creating operation:', error);
      return null;
    }
  }

  // Update operation
  async updateOperation(id: number, operation: OperationV2, userId?: number): Promise<OperationV2 | null> {
    try {
      const updated = await firstValueFrom(
        this.http.post<OperationV2>(
          `${environment.baseUrl}/operations/updateOneOperation/${id}`,
          { id: id.toString(), operation }
        )
      );

      if (updated && userId) {
        // Refresh operations list
        await this.loadAllOperations(userId);
      }

      return updated || null;
    } catch (error) {
      console.error('Error updating operation:', error);
      return null;
    }
  }

  // Delete operation
  async deleteOperation(id: number, userId?: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete<OperationV2>(`${environment.baseUrl}/operations/deleteOperation/${id}`)
      );

      if (userId) {
        // Refresh operations list
        await this.loadAllOperations(userId);
      }

      return true;
    } catch (error) {
      console.error('Error deleting operation:', error);
      return false;
    }
  }

  async uploadAccountHistory(soldeAllArray: any[], type: string): Promise<any[] | null> {
    try {
      const result = await firstValueFrom(
        this.http.post<any[]>(
          `${environment.baseUrl}/operations/uploadAccountHistory`,
          { soldeAllArray, type }
        )
      );

      return result || null;
    } catch (error) {
      console.error('Error uploading account history:', error);
      return null;
    }
  }

  // Get account history
  async getAccountHistory(): Promise<any | null> {
    try {
      const result = await firstValueFrom(
        this.http.get(`${environment.baseUrl}/operations/getAccountHistory`)
      );

      return result || null;
    } catch (error) {
      console.error('Error getting account history:', error);
      return null;
    }
  }

  // Get epargne history
  async getEpargneHistory(): Promise<any | null> {
    try {
      const result = await firstValueFrom(
        this.http.get(`${environment.baseUrl}/operations/getEpargneHistory`)
      );

      return result || null;
    } catch (error) {
      console.error('Error getting epargne history:', error);
      return null;
    }
  }

  // Utility: Export to CSV
  exportToCSV(array: any[], filename: string): void {
    const csvData = this.ConvertToCSV(array);
    const a = document.createElement('a');

    // Pour encodage avec accents
    const BOM = '\uFEFF';
    const finalData = BOM + csvData;

    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    const blob = new Blob([finalData], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private ConvertToCSV(objArray: any[]): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    if (array.length === 0) {
      return str;
    }

    // Header row
    let row = '';
    for (const index in objArray[0]) {
      row += index + ';';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    // Data rows
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ';';

        // On transforme les . des nombres par des virgules
        const value = array[i][index];
        const newValue = typeof value === 'number' ? value.toString().replace(/\./g, ',') : value;

        line += newValue;
      }
      str += line + '\r\n';
    }
    return str;
  }

  // Find operation by ID in current state (no API call)
  findOperationById(id: number): OperationV2 | undefined {
    return this.operations().find(op => op.id === id);
  }

  // Filter operations by date range
  filterByDateRange(startDate: Date, endDate: Date): OperationV2[] {
    return this.operations().filter(op => {
      const opDate = new Date(op.operationDate);
      return opDate >= startDate && opDate <= endDate;
    });
  }

  // Filter operations by account
  filterByAccount(compteId: number): OperationV2[] {
    return this.operations().filter(op => op.compteId === compteId);
  }

  // Filter operations by category
  filterByCategory(category: string): OperationV2[] {
    return this.operations().filter(op => op.categorie === category);
  }

  // Filter operations by type (credit/debit)
  filterByType(type: boolean): OperationV2[] {
    return this.operations().filter(op => op.type === type);
  }

  /* =================== Before v21 refactorisation with signals ====================== */
  /*
  public createOperation(operation: Operation) {
    return this.http.post<Operation>(
      `${environment.baseUrl}/operations/createOperation`,
      operation
    );
  }
*/
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
      `${environment.baseUrl}/operations/updateOneOperation/${value.operation.id}`,
      value
    );
  }
/*
  public deleteOperation(id: string) {
    return this.http.delete<Operation>(
      `${environment.baseUrl}/operations/deleteOperation/${id}`
    );
  }
*/
  /*
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
*/
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
/*
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

    for (let index in objArray[0]) {
      //Now convert each value to string and comma-separated
      row += index + ';';
    }
    row = row.slice(0, -1);
    //append Label row with line break
    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ';';

        // On transforme les . des nombres par des virgules
        const value = array[i][index];
        const newValue = typeof value === 'number' ? value.toString().replace(/\./g, ',') : value;

        line += newValue;
      }
      str += line + '\r\n';
    }
    return str;
  }

 */
}
