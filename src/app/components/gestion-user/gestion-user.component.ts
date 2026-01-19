import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
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
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-gestion-user',
  templateUrl: './gestion-user.component.html',
  styleUrls: ['./gestion-user.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgClass, FaIconComponent],
})
export class GestionUserComponent implements OnInit {
  private readonly cookieService = inject(CookieService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly compteService = inject(CompteService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  formSubmitted = output<User>();
  userId = input<string>(this.cookieService.get('compty-userId'));

  userForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
  });

  isSuccessful = signal(false);
  isSignUpFailed = signal(false);
  errorMessage = signal('');

  user = signal<User | null>(null);

  compteList = signal<any[]>([]);
  notActiveCompteList = signal<any[]>([]);
  compteCourantList = signal<any[]>([]);
  compteEpargneList = signal<any[]>([]);

  faPen = faPen;
  faTrashCan = faTrashCan;
  faPlus = faPlusCircle;

  dialogRef!: MatDialogRef<ConfirmationDialogComponent>;

  ngOnInit(): void {
    this.isSuccessful.set(false);
    this.compteList.set([]);
    this.compteCourantList.set([]);

    const currentUserId = this.userId();
    if (currentUserId) {
      this.userService.getOneUser(currentUserId).subscribe((user) => {
        this.user.set(user);

        this.userForm.patchValue({
          username: user.username,
          email: user.email,
        });

        this.showAccounts();
      });
    }
  }

  /* ******************  Gestion des informations du compte utilisateur *****************/
  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    const { username, email, password } = this.userForm.value;

    const data = {
      id: this.userId(),
      user: {
        username: username!,
        email: email!,
        password: password || null,
      },
    };

    this.userService.updateOneUser(data).subscribe(() => {
      this.isSuccessful.set(true);
      setTimeout(() => {
        this.isSuccessful.set(false);
        this.reloadPage();
      }, 700);
    });
  }

  reloadPage(): void {
    window.location.reload();
  }

  openConfirmation() {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });
    this.dialogRef.componentInstance.confirmMessage =
      'Etes vous sur de vouloir supprimer votre compte utilisateur ? Toutes vos données seront perdues';

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteUser();
      }
    });
  }

  deleteUser() {
    this.userService.deleteUser(this.userId()).subscribe(() => {
      alert('Votre compte a été supprimé avec succès');
      this.authService.logout().subscribe();
      sessionStorage.removeItem('auth-user');

      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 1000);
    });
  }

  /*********** Gestion des comptes bancaires ********* */

  showAccounts() {
    this.compteList.set([]);
    this.notActiveCompteList.set([]);
    this.compteCourantList.set([]);
    this.compteEpargneList.set([]);

    const activeAccounts = this.compteService.getAllAccounts();
    const notActiveAccounts = this.compteService.getAllDeactivatedAccounts();

    forkJoin([activeAccounts, notActiveAccounts]).subscribe((data) => {
      const actives = data[0];
      const notActives = data[1];

      const currentUserId = this.userId();

      // On récupère les comptes actifs
      actives.forEach((compte) => {
        if (compte.userId == currentUserId) {
          const temp = Math.round(compte.soldeActuel * 100) / 100;
          compte.soldeActuel = temp;
          this.compteList.update((list) => [...list, compte]);

          if (compte.typeCompte == 'Compte Courant') {
            this.compteCourantList.update((list) => [...list, compte]);
          } else {
            this.compteEpargneList.update((list) => [...list, compte]);
          }
        }
      });

      // On récupère les comptes inactifs
      notActives.forEach((compte) => {
        const temp = Math.round(compte.soldeActuel * 100) / 100;
        compte.soldeActuel = temp;
        this.notActiveCompteList.update((list) => [...list, compte]);
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
      });
  }

  openAccountDetail(compte: any) {
    this.dialog
      .open(CompteFormComponent, {
        data: {
          compte: compte,
          addOrEdit: 'edit',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showAccounts();
      });
  }

  deleteAccount(compte: any) {
    this.compteService.getAllAccounts().subscribe((data) => {
      const compteIndex = data.findIndex((p) => p.id == compte.id);
      this.compteService.deleteAccount(data[compteIndex].id).subscribe(() => {
        this.showAccounts();
      });
    });
  }

  reactivateAccount(compte: any) {
    this.compteService.reactivateAccount(compte.id).subscribe(() => {
      this.showAccounts();
    });
  }
}
