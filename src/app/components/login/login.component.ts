import { Component, OnInit, Renderer2, DOCUMENT, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, NgClass, FaIconComponent, RouterLink]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private cookieService = inject(CookieService);
  private router = inject(Router);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  form: any = {
    username: null,
    password: null,
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  username: string = '';

  passwordFieldType: string = 'password';
  passwordFieldIcon = faEyeSlash;

  constructor() {
    this.renderer.addClass(this.document.body, 'bg-light');
  }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.username = this.storageService.getUser().username;
    }
  }

  onSubmit(): void {
    // console.log(this.form);
    const username = this.form.username.toLowerCase();
    const password = this.form.password;
    // const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: (data) => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.username = this.storageService.getUser().username;

        this.cookieService.set(
          'auth-user',
          data.token,
          0.2,
          '/',
          undefined,
          false,
          'Strict'
        );
        this.cookieService.set(
          'userId',
          data.userId,
          0.2,
          '/',
          undefined,
          false,
          'Strict'
        );
        this.cookieService.set(
          'username',
          data.username,
          0.2,
          '/',
          undefined,
          false,
          'Strict'
        );

        // Redirection après login
        setTimeout(() => {
          this.router.navigateByUrl('/comptes');
        }, 2000);
        // this.reloadPage();
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      },
    });
  }

  reloadPage(): void {
    window.location.reload();
  }

  togglePasswordVisibility(): void {
    if (this.passwordFieldType === 'password') {
      this.passwordFieldType = 'text';
      this.passwordFieldIcon = faEye;
    } else {
      this.passwordFieldType = 'password';
      this.passwordFieldIcon = faEyeSlash;
    }
  }
}
