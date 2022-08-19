import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from '../../services/storage.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(
    private cookieService: CookieService,
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.formSubmitted = new EventEmitter<User>();
    this.userId = this.cookieService.get('userId');
  }

  ngOnInit(): void {
    this.isSuccessful = false;
    this.userService.getOneUser(this.userId).subscribe((user) => {
      this.user = user;
      // console.log(this.user);

      this.form = {
        username: user.username,
        email: user.email,
        // password: user.password,
      };
    });
  }

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

  deleteUser() {
    if (
      confirm(
        'êtes vous sur de vouloir supprimer votre compte utilisateur ? Toutes vos données seront perdues'
      ) == true
    ) {
      // TODO Suppression ne marche pas
      console.log('compte supprimé');
      let logout = this.authService.logout();
      let deleteUser = this.userService.deleteUser(this.userId);

      forkJoin([logout, deleteUser]).subscribe(() => {
        alert('Votre compte a été supprimé');

        // Redirection après suppression
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 2000);
      });
    } else {
      console.log('suppression annulé');
    }
  }
}
