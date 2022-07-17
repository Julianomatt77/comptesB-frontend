import { Component, OnInit } from '@angular/core';
import { Operation } from 'src/app/models/Operation';
import { OperationService } from 'src/app/services/operation.service';
import { OperationFormComponent } from '../operation-form/operation-form.component';
import { MatDialog } from '@angular/material/dialog';
import { CompteFormComponent } from '../compte-form/compte-form.component';
import { CompteService } from 'src/app/services/compte.service';

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
})
export class ComptesComponent implements OnInit {
  operationList: any[] = [];
  operationId!: number;

  compteList: any[] = [];

  constructor(
    private operationService: OperationService,
    private compteService: CompteService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.showOperations();
    this.showAccounts();
  }

  /* ************************* Opêrations *********** */
  showOperations() {
    this.operationList = [];
    this.operationService.getAllOperations().subscribe((data) => {
      data.forEach((operation) => {
        this.operationList.push(operation);
      });
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
      });

    // console.log('Ajoutez une opération');
  }

  openOperationDetail(operation: any) {
    // console.log(operation._id);
    // this.operationService.getOneOperation(operation._id);
    // this.operationId = operation._id;

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
      });
  }

  deleteOperation(operation: any) {
    // console.log(operation._id);
    this.operationService.deleteOperation(operation._id).subscribe(() => {
      this.showOperations();
    });
    // console.log('operation deleted');
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
}
