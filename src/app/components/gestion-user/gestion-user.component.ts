import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  computed,
  effect,
} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UserService } from 'src/app/services/user.service';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-gestion-user',
  templateUrl: './gestion-user.component.html',
  styleUrls: ['./gestion-user.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FaIconComponent],
})
export class GestionUserComponent implements OnInit {
  private readonly cookieService = inject(CookieService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
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

  // Computed signals pour les listes de comptes filtrées
  compteList = computed(() => {
    const accounts = this.compteService.allAccounts.value() ?? [];
    const currentUserId = this.userId();

    return accounts
      .map(compte => ({
        ...compte,
        soldeActuel: Math.round(compte.soldeActuel * 100) / 100,
      }));
  });

  compteCourantList = computed(() =>
    this.compteList().filter(compte => compte.typeCompte === 'Compte Courant')
  );

  compteEpargneList = computed(() =>
    this.compteList().filter(compte => compte.typeCompte !== 'Compte Courant')
  );

  notActiveCompteList = computed(() => {
    const accounts = this.compteService.deactivatedAccounts.value() ?? [];

    return accounts.map(compte => ({
      ...compte,
      soldeActuel: Math.round(compte.soldeActuel * 100) / 100,
    }));
  });

  // Computed pour vérifier si les données sont en cours de chargement
  isLoading = computed(() =>
    this.compteService.allAccounts.isLoading() ||
    this.compteService.deactivatedAccounts.isLoading()
  );

  faPen = faPen;
  faTrashCan = faTrashCan;
  faPlus = faPlusCircle;

  dialogRef!: MatDialogRef<ConfirmationDialogComponent>;

  constructor() {
    // Effect pour charger les données utilisateur
    effect(() => {
      const currentUserId = this.userId();
      if (currentUserId) {
        this.userService.getOneUser(currentUserId).subscribe((user) => {
          this.user.set(user);
          this.userForm.patchValue({
            username: user.username,
            email: user.email,
          });
        });
      }
    });
  }

  ngOnInit(): void {
    this.isSuccessful.set(false);
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

  openConfirmation(): void {
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

  deleteUser(): void {
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

  AddAccount(): void {
    this.dialog
      .open(CompteFormComponent, {
        data: {
          addOrEdit: 'add',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.compteService.refresh();
      });
  }

  openAccountDetail(compte: any): void {
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
        this.compteService.refresh();
      });
  }

  openConfirmationAccountDeletion(compte: any): void {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });
    this.dialogRef.componentInstance.confirmMessage =
      'Etes vous sur de vouloir supprimer ce compte ?';

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteAccount(compte);
      }
    });
  }

  deleteAccount(compte: any): void {
    this.compteService.deleteAccount(compte.id).subscribe(() => {
      this.compteService.refresh();
    });
  }

  reactivateAccount(compte: any): void {
    this.compteService.reactivateAccount(compte.id).subscribe(() => {
      this.compteService.refresh();
    });
  }
}
