import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Operation } from 'src/app/models/Operation';
import { OperationService } from 'src/app/services/operation.service';
import { OperationFormComponent } from '../operation-form/operation-form.component';
import { MatDialog } from '@angular/material/dialog';
import { CompteFormComponent } from '../compte-form/compte-form.component';
import { CompteService } from 'src/app/services/compte.service';
import { forkJoin } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
})
export class ComptesComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<string>;

  operationList: any[] = [];
  operationId!: string;
  operation!: Operation;
  totalCredit = 0;
  totalDebit = 0;

  compteList: any[] = [];
  compteId = '';

  // datasource = [];
  // dataSource!: MatTableDataSource<any>;
  dataSource = new MatTableDataSource(this.operationList);
  @ViewChild(MatSort) sort!: MatSort | undefined;
  @ViewChild('table') table!: MatTable<any> | undefined;
  childRevelancy = { displayColumns: [], hideColumns: [], data: [] };
  columnsToDisplay = [
    'operationDate',
    'compte',
    'montant',
    'categorie',
    'description1',
    'description2',
    'edition',
    'suppression',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form!: FormGroup;
  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  dateFiltered = false;

  constructor(
    private fb: FormBuilder,
    private operationService: OperationService,
    private compteService: CompteService,
    public dialog: MatDialog
  ) {
    this.formSubmitted = new EventEmitter<string>();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.operationList);
    this.showOperations();
    this.showAccounts();
    this.dataSource.paginator = this.paginator;

    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }

    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });

    // console.log(this.todayMonthString, this.todayYear);
  }

  /* ************************* Opêrations *********** */
  showOperations() {
    this.operationList = [];
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.operationService.getAllOperations().subscribe((data) => {
      data.forEach((operation) => {
        this.operationList.push(operation);

        if (operation.type == false) {
          this.totalDebit += operation.montant;
        } else {
          this.totalCredit += operation.montant;
        }
      });
      this.dataSource = new MatTableDataSource(this.operationList);
      this.dataSource.paginator = this.paginator;
    });
    console.log(this.dateFiltered);
  }

  AddOperation() {
    this.dialog
      .open(OperationFormComponent, {
        data: {
          // operation: operation,
          addOrEdit: 'add',
          // id: operation._id,
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showOperations();
        this.showAccounts();
      });

    // console.log('Ajoutez une opération');
  }

  openOperationDetail(operation: any) {
    this.dialog
      .open(OperationFormComponent, {
        data: {
          operation: operation,
          addOrEdit: 'edit',
          // id: operation._id,
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showOperations();
        this.showAccounts();
      });
  }

  deleteOperation(operation: any) {
    this.operationId = operation._id;

    this.operationService
      .getOneOperation(this.operationId)
      .subscribe((data) => {
        this.operation = data;
        this.compteService
          .getOneAccountByName(operation.compte)
          .subscribe((compte) => {
            let montantRestitue = -this.operation.montant;
            this.compteId = compte._id;

            compte.soldeActuel = compte.soldeActuel + montantRestitue;

            const compteData = {
              id: this.compteId,
              compte: compte,
            };

            let updateSolde = this.compteService.updateOneAccount(compteData);
            let deleteOperation = this.operationService.deleteOperation(
              this.operationId
            );

            forkJoin([updateSolde, deleteOperation]).subscribe(() => {
              this.showOperations();
              this.showAccounts();
            });
          });
      });
  }

  /* ************************* Accounts *********** */

  showAccounts() {
    this.compteList = [];
    this.compteService.getAllAccounts().subscribe((data) => {
      data.forEach((compte) => {
        this.compteList.push(compte);
      });
    });
  }

  AddAccount() {
    this.dialog
      .open(CompteFormComponent, {
        data: {
          addOrEdit: 'add',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showAccounts();
      });
  }

  openAccountDetail(compte: any) {
    this.dialog
      .open(CompteFormComponent, {
        data: {
          compte: compte,
          addOrEdit: 'edit',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showAccounts();
      });
  }

  deleteAccount(compte: any) {
    this.compteService.deleteAccount(compte._id).subscribe(() => {
      this.showAccounts();
    });
  }

  /************** Date picker ***********/
  onSubmitChangeDate() {
    let tempMonth = '';
    this.todayMonthString = this.form.value.rangeDate.split('-')[1];
    this.todayYear = this.form.value.rangeDate.split('-')[0];

    if ((new Date(Date.now()).getMonth() + 1).toString().length < 2) {
      tempMonth = '0' + (new Date(Date.now()).getMonth() + 1).toString();
    } else {
      tempMonth = (new Date(Date.now()).getMonth() + 1).toString();
    }

    if (
      this.todayMonthString != tempMonth ||
      this.todayYear != new Date(Date.now()).getFullYear().toString()
    ) {
      this.dateFiltered = true;
    }

    // TODO : Appel au backend une fonction getOperationsByMonth et get AccountsByMonth
  }

  resetDateFilters() {
    this.todayMonth = new Date(Date.now()).getMonth() + 1;
    this.todayYear = new Date(Date.now()).getFullYear().toString();
    this.todayMonthString = this.todayMonth.toString();
    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }
    this.dateFiltered = false;

    this.dataSource = new MatTableDataSource(this.operationList);
    this.showOperations();
    this.showAccounts();
    this.dataSource.paginator = this.paginator;
  }
}
