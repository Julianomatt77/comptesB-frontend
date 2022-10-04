import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from '../../services/storage.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { CompteService } from '../../services/compte.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompteFormComponent } from '../compte-form/compte-form.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import {
  faPen,
  faPlusCircle,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-gestion-user',
  templateUrl: './gestion-user.component.html',
  styleUrls: ['./gestion-user.component.css'],
})
export class GestionUserComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<User>;
  @Input() userId: string;

  // form!: FormGroup;

  form: any = {
    username: null,
    email: null,
    password: null,
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  user!: User;

  compteList: any[] = [];
  compteCourantList: any[] = [];
  compteEpargneList: any[] = [];
  faPen = faPen;
  faTrashCan = faTrashCan;
  faPlus = faPlusCircle;

  dialogRef!: MatDialogRef<ConfirmationDialogComponent>;

  constructor(
    private cookieService: CookieService,
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private compteService: CompteService,
    public dialog: MatDialog
  ) {
    this.formSubmitted = new EventEmitter<User>();
    this.userId = this.cookieService.get('userId');
  }

  ngOnInit(): void {
    this.isSuccessful = false;
    this.compteList = [];
    this.compteCourantList = [];
    this.userService.getOneUser(this.userId).subscribe((user) => {
      this.user = user;

      this.form = {
        username: user.username,
        email: user.email,
      };

      this.showAccounts();
    });
  }

  /* ******************  Gestion des informations du compte utilisateur *****************/
  onSubmit(): void {
    const { username, email, password } = this.form;
    let storageData = this.storageService.getUser();

    let data = {
      id: this.userId,
      user: {
        username: username,
        email: email,
        password: null,
      },
    };

    if (password) {
      data.user.password = password;
    }
    storageData.username = username;

    this.userService.updateOneUser(data).subscribe(() => {
      // Update session storaage data
      this.storageService.saveUser(storageData);

      // Update cookie data
      this.cookieService.set(
        'username',
        data.user.username,
        0.2,
        '/',
        undefined,
        false,
        'Strict'
      );

      this.isSuccessful = true;
      setTimeout(() => {
        this.isSuccessful = false;
        this.reloadPage();
      }, 700);
      // this.reloadPage();
    });
  }

  reloadPage(): void {
    window.location.reload();
  }

  openConfirmation() {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      // width: '250px',
      disableClose: false,
    });
    this.dialogRef.componentInstance.confirmMessage =
      'Etes vous sur de vouloir supprimer votre compte utilisateur ? Toutes vos données seront perdues';

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // do confirmation actions
        this.deleteUser();
      }
      // this.dialogRef = null;
    });
  }

  deleteUser() {
    this.userService.deleteUser(this.userId).subscribe(() => {
      alert('Votre compte a été supprimé avec succès');
      this.authService.logout().subscribe();
      sessionStorage.removeItem('auth-user');

      // Redirection après suppression
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 1000);
    });
  }

  /*********** Gestion des comptes bancaires ********* */

  showAccounts() {
    this.compteList = [];
    this.compteCourantList = [];
    this.compteEpargneList = [];
    this.compteService.getAllAccounts().subscribe((data) => {
      data.forEach((compte) => {
        if (compte.userId == this.userId) {
          let temp = Math.round(compte.soldeActuel * 100) / 100;
          compte.soldeActuel = temp;
          this.compteList.push(compte);

          if (compte.typeCompte == 'Compte Courant') {
            this.compteCourantList.push(compte);
          } else {
            this.compteEpargneList.push(compte);
          }
        }
      });
    });
  }

  AddAccount() {
    this.dialog
      .open(CompteFormComponent, {
        data: {
          addOrEdit: 'add',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showAccounts();
        // this.getSoldePerAccount(this.allOperations);
      });
  }

  openAccountDetail(compte: any) {
    this.compteService.getAllAccounts().subscribe((data) => {
      let compteIndex = data.findIndex((p) => p.name == compte.name);
      this.dialog
        .open(CompteFormComponent, {
          data: {
            compte: data[compteIndex],
            addOrEdit: 'edit',
          },
          width: '60%',
        })
        .afterClosed()
        .subscribe(() => {
          this.showAccounts();
          // this.getSoldePerAccount(this.allOperations);
        });
    });
  }

  deleteAccount(compte: any) {
    this.compteService.getAllAccounts().subscribe((data) => {
      let compteIndex = data.findIndex((p) => p.name == compte.name);
      this.compteService.deleteAccount(data[compteIndex]._id).subscribe(() => {
        this.showAccounts();
        // this.getSoldePerAccount(this.allOperations);
      });
    });
  }
}
