import { Component, OnInit } from '@angular/core';
import { Operation } from 'src/app/models/Operation';
import { OperationService } from 'src/app/services/operation.service';
import { OperationFormComponent } from '../operation-form/operation-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
})
export class ComptesComponent implements OnInit {
  operationList: any[] = [];
  operationId!: number;

  constructor(
    private operationService: OperationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.showOperations();
  }

  showOperations() {
    this.operationList = [];
    this.operationService.getAllOperations().subscribe((data) => {
      data.forEach((operation) => {
        this.operationList.push(operation);
      });
      // this.operationList = data;
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
}
