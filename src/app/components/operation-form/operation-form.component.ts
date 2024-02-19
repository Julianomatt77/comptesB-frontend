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
import { CookieService } from 'ngx-cookie-service';

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
    'Epargne',
    'Prélèvement',
    'Pub',
    'Remboursement',
    'Restaurant',
    'Salaire',
    'Transfert',
    'Voyage',
    'santé',
  ];
  compteList: any[] = [];
  userId!: string;

  compteId = '';
  tempMontant = 0;

  operationDateDay!: string;
  operationDateMonth!: string;
  operationDateYear!: string;
  operationdateString!: string;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private operationService: OperationService,
    public dialogRef: MatDialogRef<OperationFormComponent>,
    public compteService: CompteService,
    private cookieService: CookieService
  ) {
    this.formSubmitted = new EventEmitter<Operation>();
    this.userId = this.cookieService.get('userId');
    this.compteList = data.compteList;

    if (data.addOrEdit == 'edit') {
      this.addOrEdit = 'edit';
      this.buttonLabel = 'Mettre à jour';
      this.id = data.operation._id;
      this.operation = data.operation;
      this.operation.operationDate = new Date(
        this.operation.operationDate.toString()
      );
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
        '',
        '',
        new Date(Date.now()),
        0
      );
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      montant: [0, [Validators.required]],
      type: false,
      categorie: ['', [Validators.required]],
      compte: ['', [Validators.required]],
      compteName: '',
      compteType: '',
      description1: ['', [Validators.required]],
      description2: '',
      operationDate: [Date(), [Validators.required]],
      solde: 0,
    });

    this.initForm();
  }

  private initForm(): void {
    if (this.addOrEdit == 'edit') {
      if (this.operation.montant < 0){
        this.operation.montant = -this.operation.montant;
      }
      this.operation.operationDate = new Date(this.operation.operationDate);

      this.tempMontant = this.operation.montant;
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
    const compte = this.compteList.find(compte => compte._id === this.operation.compte)

    this.operation.solde =
      compte.soldeActuel + (this.operation.montant - this.tempMontant);

    this.compteId = compte._id;
    compte.soldeActuel = this.operation.solde;

    this.operation.montant = this.isCredit(
      this.operation.type,
      this.operation.montant
    );

    const compteData = {
      id: this.compteId,
      compte: compte,
    };

    let updateSolde = this.compteService.updateOneAccount(compteData);

    if (this.addOrEdit == 'edit') {
      const data = {
        id: this.id,
        operation: this.operation,
      };
      let updateOperation = this.operationService.updateOneOperation(data);

      forkJoin([updateSolde, updateOperation]).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
      let createOperation = this.operationService.createOperation(
        this.operation
      );

      forkJoin([updateSolde, createOperation]).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  changeFn(e: any) {
    this.operation.operationDate = e.target.value;
  }
}
