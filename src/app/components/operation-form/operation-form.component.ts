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

@Component({
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.css'],
})
export class OperationFormComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<Operation>;
  @Input() id!: number;

  form!: FormGroup;
  operation!: Operation;
  addOrEdit!: string;
  buttonLabel!: string;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private operationService: OperationService,
    public dialogRef: MatDialogRef<OperationFormComponent>
  ) {
    this.formSubmitted = new EventEmitter<Operation>();
    if (data.addOrEdit == 'edit') {
      this.addOrEdit = 'edit';
      this.buttonLabel = 'Mettre à jour';
      this.id = data.operation._id;
      this.operation = data.operation;
    } else {
      this.addOrEdit = 'add';
      this.buttonLabel = 'Ajouter';
      this.operation = new Operation(0, 0, false, '', '', '', '', new Date());
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      montant: '',
      type: '',
      categorie: '',
      compte: '',
      description1: '',
      description2: '',
      operationDate: '',
    });
    this.initForm();
  }

  private initForm(): void {
    console.log(this.addOrEdit);
    if (this.addOrEdit == 'edit') {
      this.operationService.getOneOperation(this.id).subscribe((data) => {
        this.operation = data;
        // ? data
        // : new Operation(0, 0, false, '', '', '', '', new Date());
      });
    }
  }

  onSubmitOperationForm(): void {
    if (this.addOrEdit == 'edit') {
      const data = {
        id: this.id,
        operation: this.operation,
      };
      this.operationService.updateOneOperation(data).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
      this.operationService.createOperation(this.operation).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }
}
