import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  Inject,
} from '@angular/core';
import { Compte } from 'src/app/models/Compte';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompteService } from 'src/app/services/compte.service';
import {faClose} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-compte-form',
  templateUrl: './compte-form.component.html',
  styleUrls: ['./compte-form.component.css'],
})
export class CompteFormComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<Compte>;
  @Input() id!: string;

  form!: FormGroup;
  compte!: Compte;
  addOrEdit!: string;
  buttonLabel!: string;

  typeList: string[] = ['Compte Courant', 'Epargne', 'Bourse'];

  faClose = faClose;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private compteService: CompteService,
    public dialogRef: MatDialogRef<CompteFormComponent>
  ) {
    this.formSubmitted = new EventEmitter<Compte>();
    if (data.addOrEdit == 'edit') {
      this.addOrEdit = 'edit';
      this.buttonLabel = 'Mettre à jour';
      this.id = data.compte._id;
      this.compte = data.compte;
    } else {
      this.addOrEdit = 'add';
      this.buttonLabel = 'Ajouter';
      this.compte = new Compte('', '', '', 0, 0);
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      typeCompte: ['', [Validators.required]],
      soldeInitial: 0,
      soldeActuel: 0,
    });

    this.initForm();
  }
  private initForm(): void {
    if (this.addOrEdit == 'edit') {
      this.compteService.getOneAccount(this.id).subscribe((data) => {
        // console.log(data);
        this.compte = data;
      });
    }
  }

  onSubmitCompteForm(): void {
    if (this.addOrEdit == 'edit') {
      const data = {
        id: this.id,
        compte: this.compte,
      };
      this.compteService.updateOneAccount(data).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
      this.compteService.createAccount(this.compte).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  closePopup(){
    this.dialogRef.close();
  }
}
