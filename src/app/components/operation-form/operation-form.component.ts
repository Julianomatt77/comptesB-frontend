import {Component, OnInit, EventEmitter, Output, Input, inject, ChangeDetectionStrategy, signal} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { OperationService } from 'src/app/services/operation.service';
import { CompteService } from 'src/app/services/compte.service';
import { forkJoin } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import {faClose} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DatePipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {OperationV2} from "../../models/operation.model";
import {SlideToggleComponent} from "../../ui/slide-toggle/slide-toggle.component";

@Component({
    selector: 'app-operation-form',
    templateUrl: './operation-form.component.html',
    styleUrls: ['./operation-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, FaIconComponent, MatSlideToggleModule, SlideToggleComponent]
})
export class OperationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);
  private operationService = inject(OperationService);
  dialogRef = inject<MatDialogRef<OperationFormComponent>>(MatDialogRef);
  compteService = inject(CompteService);
  private cookieService = inject(CookieService);

  @Output() formSubmitted: EventEmitter<OperationV2>;
  @Input() id!: string;

  form!: FormGroup;
  operation!: OperationV2;
  operationReceveur!: OperationV2;
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
    'santé',
    'Transfert',
    'Voyage',
  ];
  compteList: any[] = [];
  groupedComptes: { [key: string]: any[] } = {};
  groupedCompteTypes: string[] = [];
  userId!: string;
  transfertBetweenAccount = signal(false);
  submitted: boolean = false;

  compteId = '';
  compteReceveurId = '';
  tempMontant = 0;
  tempMontantReceveur = 0;

  faClose = faClose;

  constructor() {
    const data = this.data;

    this.formSubmitted = new EventEmitter<OperationV2>();
    this.userId = this.cookieService.get('compty-userId');
    this.compteList = data.compteList;

    // On réorganise l'ordre d'affichage des comptes
    this.compteList = this.compteService.sortCompteListByType(this.compteList);
    this.groupedComptes = this.compteService.groupComptesByType(this.compteList);
    this.groupedCompteTypes = Object.keys(this.groupedComptes);

    if (data.addOrEdit == 'edit') {
      this.addOrEdit = 'edit';
      this.buttonLabel = 'Mettre à jour';
      this.id = data.operation.id;
      this.operation = data.operation;
      this.operation.operationDate = new Date(
        this.operation.operationDate.toString()
      );
    } else {
      this.addOrEdit = 'add';
      this.buttonLabel = 'Ajouter';
      this.operation = {} as OperationV2
      this.operation.operationDate = new Date(Date.now());
      this.operationReceveur = {} as OperationV2
      this.operationReceveur.operationDate = new Date(Date.now());
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      montant: [0, [Validators.required, Validators.min(0.01)]],
      type: [false],
      categorie: ['', [Validators.required]],
      compte: [this.compteList[0]?.id || '', [Validators.required]],
      compteReceveur: [''],
      description1: ['', [Validators.required]],
      operationDate: [this.formatDate(this.operation.operationDate), [Validators.required]],
      isTransfert: [false],
    });

    if (this.addOrEdit  == 'edit') {
      this.form = this.fb.group({
        montant: [this.operation.montant, [Validators.required, Validators.min(0.01)]],
        type: [this.operation.type],
        categorie: [this.operation.categorie, [Validators.required]],
        compte: [this.operation.compteId, [Validators.required]],
        compteReceveur: [''],
        description1: [this.operation.description1, [Validators.required]],
        operationDate: [this.formatDate(this.operation.operationDate), [Validators.required]],
        isTransfert: [false],
      });
    }

    this.initForm();
  }

// Format date pour input type="date" (yyyy-MM-dd)
  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  // Component
  get operationDateForInput(): string {
    const date = this.operation.operationDate ?? new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
    this.submitted = true;

    if (!this.form.valid) return;

    // Récupération des valeurs depuis le formulaire
    const montant = this.form.get('montant')?.value ?? 0;
    const type = this.form.get('type')?.value ?? false;
    const categorie = this.form.get('categorie')?.value ?? '';
    const compteId = this.form.get('compte')?.value;
    const compteReceveurId = this.form.get('compteReceveur')?.value;
    const isTransfert = this.form.get('isTransfert')?.value ?? false;
    const description1 = this.form.get('description1')?.value ?? '';
    const operationDate = this.form.get('operationDate')?.value ?? new Date();

    // Récupération du compte principal
    const compte = this.compteList.find(c => c.id === compteId);
    if (!compte) {
      console.error('Compte non trouvé pour l’ID:', compteId);
      return;
    }

    // Préparation de l'opération principale
    this.operation.type = type;
    this.operation.montant = type ? +montant : -montant;
    this.operation.categorie = categorie;
    this.operation.description1 = description1;
    this.operation.operationDate = new Date(this.form.get('operationDate')?.value);
    this.operation.compteId = compteId;

    this.changeDate(this.operation.operationDate)

    // Calcul du solde du compte
    this.operation.solde = compte.soldeActuel + (this.operation.montant - this.tempMontant);
    compte.soldeActuel = this.operation.solde;

    // Update du compte principal
    const updateSolde = this.compteService.updateOneAccount({ id: compteId, compte });

    // Si transfert entre comptes
    if (isTransfert && compteReceveurId) {
      const compteReceveur = this.compteList.find(c => c.id === compteReceveurId);
      if (!compteReceveur) {
        console.error('Compte receveur non trouvé pour l’ID:', compteReceveurId);
        return;
      }

      // Préparation de l'opération receveur
      this.operationReceveur = {
        ...this.operationReceveur,
        compteId: compteReceveurId,
        type: true,
        montant: -this.operation.montant,
        categorie,
        description1,
        operationDate,
        solde: compteReceveur.soldeActuel + (-this.operation.montant - this.tempMontantReceveur),
      };

      compteReceveur.soldeActuel = this.operationReceveur.solde;

      const updateSoldeReceveur = this.compteService.updateOneAccount({
        id: compteReceveurId,
        compte: compteReceveur
      });

      // Création des opérations
      const createOperation = this.operationService.createOperation(this.operation);
      const createOperationReceveur = this.operationService.createOperation(this.operationReceveur);

      forkJoin([updateSolde, updateSoldeReceveur, createOperation, createOperationReceveur])
        .subscribe(() => this.dialogRef.close());

    } else {
      // Pas de transfert, juste création ou mise à jour de l'opération
      if (this.addOrEdit === 'edit') {
        const updateOperation = this.operationService.updateOperation(Number(this.id), this.operation);
        forkJoin([updateSolde, updateOperation]).subscribe(() => this.dialogRef.close());
      } else {
        const createOperation = this.operationService.createOperation(this.operation);
        forkJoin([updateSolde, createOperation]).subscribe(() => this.dialogRef.close());
      }
    }
  }

  changeFn(e: any) {
    this.operation.operationDate = e.target.value;
  }

  changeTransfert(e: any){
    this.transfertBetweenAccount.set(this.operation.isTransfert)
    this.operation.categorie = this.categorieList[10];
    this.operation.description1 = this.categorieList[10];
    this.form.get('description1')?.setValue(this.categorieList[10])
    this.operation.type = false
    this.operation.isTransfert = !this.operation.isTransfert

    let cat = this.form.get('categorie')
    cat?.setValue(this.categorieList[10])
  }

  changeDate(date: Date) {
    const now = new Date();
    const seconds = now.getSeconds()
    const minutes = now.getMinutes()
    const hours = now.getHours()

    date.setHours(hours, minutes, seconds);
    this.operation.operationDate = date;
  }

  closePopup(){
    this.dialogRef.close();
  }
}
