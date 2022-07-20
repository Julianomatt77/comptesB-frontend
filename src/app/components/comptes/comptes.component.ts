import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
})
export class ComptesComponent implements OnInit {
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

  constructor(
    private operationService: OperationService,
    private compteService: CompteService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.operationList);
    this.showOperations();
    this.showAccounts();
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    // this.showOperations();
    // this.dataSource.paginator = this.paginator;
    // console.log(this.paginator);
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
}
