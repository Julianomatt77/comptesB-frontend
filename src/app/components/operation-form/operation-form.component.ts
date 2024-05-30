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
import {faClose} from '@fortawesome/free-solid-svg-icons';

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
  operationReceveur!: Operation;
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
  ];
  compteList: any[] = [];
  groupedComptes: { [key: string]: any[] } = {};
  groupedCompteTypes: string[] = [];
  userId!: string;
  transfertBetweenAccount = false;

  compteId = '';
  compteReceveurId = '';
  tempMontant = 0;
  tempMontantReceveur = 0;

  operationDateDay!: string;
  operationDateMonth!: string;
  operationDateYear!: string;
  operationdateString!: string;

  faClose = faClose;

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

    // On réorganise l'ordre d'affichage des comptes
    this.compteList = this.compteService.sortCompteListByType(this.compteList);
    this.groupedComptes = this.compteService.groupComptesByType(this.compteList);
    this.groupedCompteTypes = Object.keys(this.groupedComptes);

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
        0,
        false,
        ''
      );
      this.operationReceveur = new Operation(
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
        0,
        false,
        ''
      );
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      montant: [0, [Validators.required]],
      type: false,
      categorie: [this.categorieList[9], [Validators.required]],
      compte: ['', [Validators.required]],
      compteName: '',
      compteType: '',
      description1: ['', [Validators.required]],
      description2: '',
      operationDate: [Date(), [Validators.required]],
      solde: 0,
      isTransfert: false,
      compteReceveur: "",
      compteReceveurName: ""
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

    if (this.transfertBetweenAccount) {
      this.operationReceveur.compte = this.operation.compteReceveur
      this.operationReceveur.description1 = this.operation.description1
      this.operationReceveur.categorie = this.operation.categorie
      this.operationReceveur.operationDate = this.operation.operationDate
      this.operationReceveur.type = true

      const compteReceveur = this.compteList.find(compte => compte._id === this.operation.compteReceveur)
      this.operationReceveur.solde = compteReceveur.soldeActuel + (this.operationReceveur.montant - this.tempMontantReceveur);
      this.compteReceveurId = compteReceveur._id;
      compteReceveur.soldeActuel = this.operationReceveur.solde
      this.operationReceveur.montant = -this.operation.montant

      const compteDataReceveur = {
        id: this.compteReceveurId,
        compte: compteReceveur,
      };

      let updateSoldeReceveur = this.compteService.updateOneAccount(compteDataReceveur);
      let createOperationReceveur = this.operationService.createOperation(this.operationReceveur);
      let createOperation = this.operationService.createOperation(this.operation);

      forkJoin([updateSolde, createOperation, updateSoldeReceveur, createOperationReceveur]).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
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
  }

  changeFn(e: any) {
    this.operation.operationDate = e.target.value;
  }

  changeTransfert(e: any){
    this.transfertBetweenAccount = this.operation.isTransfert
    this.operation.categorie = this.categorieList[9];
    this.operation.description1 = this.categorieList[9];
    this.operation.type = false
  }

  closePopup(){
    this.dialogRef.close();
  }
}
