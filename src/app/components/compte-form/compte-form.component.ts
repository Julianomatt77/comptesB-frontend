import { Component, OnInit, output, input, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompteService } from 'src/app/services/compte.service';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CompteV2 } from "../../models/compte.model";

@Component({
  selector: 'app-compte-form',
  templateUrl: './compte-form.component.html',
  styleUrls: ['./compte-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FaIconComponent]
})
export class CompteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);
  private compteService = inject(CompteService);
  private dialogRef = inject<MatDialogRef<CompteFormComponent>>(MatDialogRef);

  // Utilisation des nouvelles APIs input() et output()
  formSubmitted = output<CompteV2>();
  id = input<string>('');

  form!: FormGroup;
  addOrEdit = signal<string>('add');
  buttonLabel = signal<string>('Ajouter');

  typeList: string[] = ['Compte Courant', 'Epargne', 'Bourse'];
  faClose = faClose;

  constructor() {
    const data = this.data;

    if (data.addOrEdit === 'edit') {
      this.addOrEdit.set('edit');
      this.buttonLabel.set('Mettre à jour');
    } else {
      this.addOrEdit.set('add');
      this.buttonLabel.set('Ajouter');
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const data = this.data;

    if (this.addOrEdit() === 'edit' && data.compte) {
      this.form = this.fb.group({
        name: [data.compte.name, [Validators.required]],
        typeCompte: [data.compte.typeCompte, [Validators.required]],
        soldeInitial: [data.compte.soldeInitial],
        soldeActuel: [data.compte.soldeActuel],
      });
    } else {
      this.form = this.fb.group({
        name: ['', [Validators.required]],
        typeCompte: ['', [Validators.required]],
        soldeInitial: [0],
        soldeActuel: [0],
      });
    }
  }

  onSubmitCompteForm(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const compte: CompteV2 = {
      id: this.addOrEdit() === 'edit' ? this.data.compte.id : '',
      name: formValue.name,
      typeCompte: formValue.typeCompte,
      soldeInitial: formValue.soldeInitial,
      soldeActuel: formValue.soldeActuel,
    };

    if (this.addOrEdit() === 'edit') {
      const data = {
        id: this.data.compte.id,
        compte,
      };
      this.compteService.updateOneAccount(data).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
      this.compteService.createAccount(compte).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  closePopup(): void {
    this.dialogRef.close();
  }
}
