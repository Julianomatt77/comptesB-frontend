import { Injectable, inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OperationService } from 'src/app/services/operation.service';

@Injectable({
  providedIn: 'root',
})
export class DatepickerService {
  private fb = inject(FormBuilder);
  private operationService = inject(OperationService);

  totalCredit = 0;
  totalDebit = 0;
  form!: FormGroup;
  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  dateFiltered = false;

  constructor() {
    this.transformMonth(this.todayMonthString);

    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });
  }

  transformMonth(month: string) {
    if (month.length < 2) {
      month = 0 + month;
    } else {
      month = month;
    }
    return month;
  }

  onSubmitChangeDate(month: string, year: string, operationList: any[]) {
    let tempMonth = '';

    // Récupération de la date depuis le formulaire html
    // month = this.form.value.rangeDate.split('-')[1];
    // year = this.form.value.rangeDate.split('-')[0];

    // Si pas de filtre -> date d'aujourd'hui
    if ((new Date(Date.now()).getMonth() + 1).toString().length < 2) {
      tempMonth = '0' + (new Date(Date.now()).getMonth() + 1).toString();
    } else {
      tempMonth = (new Date(Date.now()).getMonth() + 1).toString();
    }

    // Si valeur du datepicker different de la date d'aujourd'hui almors un filtre est appliqué
    if (
      month != tempMonth ||
      year != new Date(Date.now()).getFullYear().toString()
    ) {
      this.dateFiltered = true;
    }

    // Appel au backend pour filtrer les données par date
    operationList = [];
    this.totalCredit = 0;
    this.totalDebit = 0;

    // this.showOperationsFiltered(month, year, operationList);

    return [operationList];
  }

  resetDateFilters(month: number, year: string, monthString: string) {
    month = new Date(Date.now()).getMonth() + 1;
    year = new Date(Date.now()).getFullYear().toString();
    monthString = month.toString();
    if (monthString.length < 2) {
      monthString = 0 + monthString;
    }
    this.dateFiltered = false;

    return [monthString, year, this.dateFiltered];

    // this.showOperations();
    // this.showAccounts();
  }

  // showOperationsFiltered(month: string, year: string, operationList: [], userId: string) {
  //   this.operationService
  //     .getOperationsFiltered(month, year)
  //     .subscribe((data) => {
  //       data.forEach((operation) => {
  //         if (operation.userId == userId) {
  //           operationList.push(operation);
  //           this.totalOperations(operation.montant, operation.type);
  //         }
  //       });
  //       // this.dataSource = new MatTableDataSource(operationList);
  //       // this.dataSource.paginator = this.paginator;
  //     });
  // }
}
