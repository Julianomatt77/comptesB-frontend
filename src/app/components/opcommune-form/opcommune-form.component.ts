import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  Inject,
} from '@angular/core';
import { OpCommune } from 'src/app/models/OpCommune';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OpCommunesService } from 'src/app/services/op-communes.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-opcommune-form',
  templateUrl: './opcommune-form.component.html',
  styleUrls: ['./opcommune-form.component.css'],
})
export class OpcommuneFormComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<OpCommune>;
  @Input() id!: string;

  userList: any[] = [];

  form!: FormGroup;
  operation!: OpCommune;
  addOrEdit!: string;
  buttonLabel!: string;
  userId!: string;

  tempMontant = 0;

  operationDateDay!: string;
  operationDateMonth!: string;
  operationDateYear!: string;
  operationdateString!: string;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<OpcommuneFormComponent>,
    private opCommuneService: OpCommunesService,
    private cookieService: CookieService
  ) {
    this.formSubmitted = new EventEmitter<OpCommune>();
    this.userId = this.cookieService.get('userId');
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
      this.operation = new OpCommune(
        '',
        0,
        // false,
        '',
        '',
        new Date(Date.now())
      );
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      montant: 0,
      // type: false,
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      operationDate: [Date(), [Validators.required]],
    });
    // console.log(this.form);

    this.opCommuneService.getAllUsers().subscribe((data) => {
      data.forEach((user) => {
        if (user.userId == this.userId) {
          this.userList.push(user.name);
        }
      });
    });

    this.initForm();
  }

  private initForm(): void {
    if (this.addOrEdit == 'edit') {
      this.opCommuneService.getOneOperation(this.id).subscribe((data) => {
        this.operation = data;
        this.operation.operationDate = new Date(this.operation.operationDate);
      });
      this.tempMontant = this.operation.montant;
    }
  }

  onSubmitOperationForm(): void {
    const data = { id: this.id, operation: this.operation };

    if (this.addOrEdit == 'edit') {
      // console.log(this.operation);
      this.opCommuneService
        .getOneUserByName(this.operation.name)
        .subscribe((user) => {
          // console.log(user);
          // console.log(this.operation);
          // let operationIndex = user.history.findIndex((p)=> p._id == this.operation.id)
        });

      this.opCommuneService
        .updateOneOperation(data)
        .subscribe(() => this.dialogRef.close());
      // this.compteService
      //   .getOneAccountByName(this.operation.compte)
      //   .subscribe((compte) => {
      //     this.operation.montant = this.isCredit(
      //       this.operation.type,
      //       this.operation.montant
      //     );

      //     this.operation.solde =
      //       compte.soldeActuel + (this.operation.montant - this.tempMontant);

      //     this.compteId = compte._id;
      //     compte.soldeActuel = this.operation.solde;

      //     const compteData = {
      //       id: this.compteId,
      //       compte: compte,
      //     };

      //     const data = {
      //       id: this.id,
      //       operation: this.operation,
      //     };

      //     let updateSolde = this.compteService.updateOneAccount(compteData);
      //     let updateOperation = this.operationService.updateOneOperation(data);

      //     forkJoin([updateSolde, updateOperation]).subscribe(() => {
      //       this.dialogRef.close();
      //     });
      //   });
    } else {
      // this.opCommuneService
      //   .getOneUserByName(this.operation.name)
      //   .subscribe((user) => {
      //     user.history.push(this.operation);

      //     const userdata = {
      //       id: user._id,
      //       user: user,
      //     };
      //     this.opCommuneService.updateOneUser(userdata).subscribe();
      //   });

      this.opCommuneService
        .createOperation(this.operation)
        .subscribe(() => this.dialogRef.close());

      // this.compteService
      //   .getOneAccountByName(this.operation.compte)
      //   .subscribe((compte) => {
      //     this.operation.montant = this.isCredit(
      //       this.operation.type,
      //       this.operation.montant
      //     );

      //     this.operation.solde = compte.soldeActuel + this.operation.montant;

      //     this.compteId = compte._id;
      //     compte.soldeActuel = this.operation.solde;

      //     const compteData = {
      //       id: this.compteId,
      //       compte: compte,
      //     };

      //     let updateSolde = this.compteService.updateOneAccount(compteData);
      //     let createOperation = this.operationService.createOperation(
      //       this.operation
      //     );

      //     forkJoin([updateSolde, createOperation]).subscribe(() => {
      //       this.dialogRef.close();
      //     });
      //   });
    }
  }

  changeFn(e: any) {
    this.operation.operationDate = e.target.value;
  }
}
