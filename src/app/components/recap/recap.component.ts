import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Operation } from 'src/app/models/Operation';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OperationService } from 'src/app/services/operation.service';
import { DatepickerService } from 'src/app/services/datepicker.service';
import { Recap } from '../../interfaces/recap';

@Component({
  selector: 'app-recap',
  templateUrl: './recap.component.html',
  styleUrls: ['./recap.component.css'],
})
export class RecapComponent implements OnInit {
  operationList: any[] = [];
  operationId!: string;
  operation!: Operation;
  totalCredit = 0;
  totalDebit = 0;
  userId!: string;
  compteList: any[] = [];
  compteId = '';
  form!: FormGroup;
  operationPerYear: Recap[] = [
    { month: 'Janvier', economie: 0, solde: 0 },
    { month: 'Février', economie: 0, solde: 0 },
    { month: 'Mars', economie: 0, solde: 0 },
    { month: 'Avril', economie: 0, solde: 0 },
    { month: 'Mai', economie: 0, solde: 0 },
    { month: 'Juin', economie: 0, solde: 0 },
    { month: 'Juillet', economie: 0, solde: 0 },
    { month: 'Août', economie: 0, solde: 0 },
    { month: 'Septembre', economie: 0, solde: 0 },
    { month: 'Octobre', economie: 0, solde: 0 },
    { month: 'Novembre', economie: 0, solde: 0 },
    { month: 'Décembre', economie: 0, solde: 0 },
  ];
  displayYear: Array<number> = [];

  dataSource = new MatTableDataSource(this.operationPerYear);
  @ViewChild(MatSort) sort!: MatSort | undefined;
  @ViewChild('table') table!: MatTable<any> | undefined;
  childRevelancy = { displayColumns: [], hideColumns: [], data: [] };
  columnsToDisplay = ['month', 'economie', 'solde'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  dateFiltered = false;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    private operationService: OperationService,
    private datePickerService: DatepickerService
  ) {
    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });

    this.userId = this.cookieService.get('userId');
  }

  ngOnInit(): void {
    let year = new Date(Date.now()).getFullYear() - 1;
    for (let i = 0; i < 50; i++) {
      this.displayYear.push(year - i);
    }

    this.dataSource = new MatTableDataSource(this.operationPerYear);
    this.showOperations(this.todayYear);
    this.dataSource.paginator = this.paginator;

    this.todayMonthString = this.datePickerService.transformMonth(
      this.todayMonthString
    );
  }

  totalOperations(montant: number, type: boolean) {
    if (type == false) {
      this.totalDebit += montant;
    } else {
      this.totalCredit += montant;
    }

    let temp1 = Math.round(this.totalDebit * 100) / 100;
    this.totalDebit = temp1;

    let temp2 = Math.round(this.totalCredit * 100) / 100;
    this.totalCredit = temp2;
  }

  showOperations(year: string) {
    // Remise à 0 du tableau
    this.operationPerYear.forEach((data) => {
      data.economie = 0;
      data.solde = 0;
    });
    this.totalCredit = 0;
    this.totalDebit = 0;

    for (let i = 0; i < 12; i++) {
      this.operationService
        .getOperationsFiltered((i + 1).toString(), year)
        .subscribe((data) => {
          data.forEach((monthData) => {
            if (monthData.userId == this.userId) {
              this.operationPerYear[i].economie += monthData.montant;
              this.operationPerYear[i].economie =
                Math.round(this.operationPerYear[i].economie * 100) / 100;

              this.totalOperations(monthData.montant, monthData.type);
            }
          });

          // MAJ du tableau
          this.dataSource = new MatTableDataSource(this.operationPerYear);
          this.dataSource.paginator = this.paginator;
        });
    }
  }

  onSubmitChangeDate() {
    this.todayYear = this.form.value.rangeDate;

    // Si valeur du datepicker different de la date d'aujourd'hui almors un filtre est appliqué
    if (this.todayYear != new Date(Date.now()).getFullYear().toString()) {
      this.dateFiltered = true;
    }

    this.showOperations(this.todayYear);
  }
}
