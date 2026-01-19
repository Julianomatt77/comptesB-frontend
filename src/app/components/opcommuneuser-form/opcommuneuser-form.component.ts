import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  Inject,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OpCommuneUser } from 'src/app/models/OpCommuneUser';
import { OpCommunesService } from 'src/app/services/op-communes.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-opcommuneuser-form',
  templateUrl: './opcommuneuser-form.component.html',
  styleUrls: ['./opcommuneuser-form.component.css'],
})
export class OpcommuneuserFormComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<OpCommuneUser>;
  @Input() id!: string;

  form!: FormGroup;
  user!: OpCommuneUser;
  addOrEdit!: string;
  buttonLabel!: string;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private opCommuneService: OpCommunesService,
    public dialogRef: MatDialogRef<OpcommuneuserFormComponent>
  ) {
    this.formSubmitted = new EventEmitter<OpCommuneUser>();
    if (data.addOrEdit == 'edit') {
      this.addOrEdit = 'edit';
      this.buttonLabel = 'Mettre à jour';
      this.id = data.user.id;
      this.user = data.user;
    } else {
      this.addOrEdit = 'add';
      this.buttonLabel = 'Ajouter';
      this.user = new OpCommuneUser('', '', []);
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      history: [],
    });

    this.initForm();
  }

  private initForm(): void {
    if (this.addOrEdit == 'edit') {
      this.opCommuneService.getOneUser(this.id).subscribe((data) => {
        this.user = data;
      });
    }
  }
  onSubmitUserForm(): void {
    if (this.addOrEdit == 'edit') {
      const data = {
        id: this.id,
        user: this.user,
      };
      this.opCommuneService.updateOneUser(data).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
      this.opCommuneService.createUser(this.user).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }
}
