import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  Inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Operation } from 'src/app/models/Operation';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperationService } from 'src/app/services/operation.service';
import { CompteService } from 'src/app/services/compte.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.css'],
})
export class OperationFormComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<Operation>;
  @Input() id!: string;

  form!: FormGroup;
  operation!: Operation;
  addOrEdit!: string;
  buttonLabel!: string;
  categorieList: string[] = [
    'Courses',
    'Divers',
    'Essence',
    'Prélèvement',
    'Pub',
    'Remboursement',
    'Restaurant',
    'Salaire',
    'Transfert',
    'Voyage',
  ];
  compteList: string[] = [];

  compteId = '';
  tempMontant = 0;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private operationService: OperationService,
    public dialogRef: MatDialogRef<OperationFormComponent>,
    public compteService: CompteService
  ) {
    this.formSubmitted = new EventEmitter<Operation>();
    if (data.addOrEdit == 'edit') {
      this.addOrEdit = 'edit';
      this.buttonLabel = 'Mettre à jour';
      this.id = data.operation._id;
      this.operation = data.operation;
      this.operation.operationDate = new Date(this.operation.operationDate);
    } else {
      this.addOrEdit = 'add';
      this.buttonLabel = 'Ajouter';
      this.operation = new Operation(
        '',
        0,
        false,
        '',
        '',
        '',
        '',
        new Date(),
        0
      );
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      montant: 0,
      type: false,
      categorie: '',
      compte: '',
      description1: '',
      description2: '',
      operationDate: Date(),
      solde: 0,
    });

    this.compteService.getAllAccounts().subscribe((data) => {
      data.forEach((compte) => {
        this.compteList.push(compte.name);
      });
    });

    this.initForm();
  }

  private initForm(): void {
    if (this.addOrEdit == 'edit') {
      this.operationService.getOneOperation(this.id).subscribe((data) => {
        this.operation = data;
        console.log(this.operation);
        this.operation.operationDate = new Date(this.operation.operationDate);
        // ? data
        // : new Operation(0, 0, false, '', '', '', '', new Date());
      });
      this.tempMontant = this.operation.montant;
      console.log(this.tempMontant);
    }
  }

  isCredit(type: boolean, montant: number) {
    if (type == false) {
      montant = -montant;
    } else {
      montant = +montant;
    }
    return montant;
  }

  onSubmitOperationForm(): void {
    if (this.addOrEdit == 'edit') {
      this.compteService
        .getOneAccountByName(this.operation.compte)
        .subscribe((compte) => {
          this.operation.montant = this.isCredit(
            this.operation.type,
            this.operation.montant
          );

          this.operation.solde =
            compte.soldeActuel + (this.operation.montant - this.tempMontant);

          this.compteId = compte._id;
          compte.soldeActuel = this.operation.solde;

          const compteData = {
            id: this.compteId,
            compte: compte,
          };

          const data = {
            id: this.id,
            operation: this.operation,
          };

          let updateSolde = this.compteService.updateOneAccount(compteData);
          let updateOperation = this.operationService.updateOneOperation(data);

          forkJoin([updateSolde, updateOperation]).subscribe(() => {
            this.dialogRef.close();
          });
        });
    } else {
      this.compteService
        .getOneAccountByName(this.operation.compte)
        .subscribe((compte) => {
          this.operation.montant = this.isCredit(
            this.operation.type,
            this.operation.montant
          );

          this.operation.solde = compte.soldeActuel + this.operation.montant;

          this.compteId = compte._id;
          compte.soldeActuel = this.operation.solde;

          const compteData = {
            id: this.compteId,
            compte: compte,
          };

          let updateSolde = this.compteService.updateOneAccount(compteData);
          let createOperation = this.operationService.createOperation(
            this.operation
          );

          forkJoin([updateSolde, createOperation]).subscribe(() => {
            this.dialogRef.close();
          });
        });
    }
  }

  changeFn(e: any) {
    this.operation.operationDate = e.target.value;
  }
}
