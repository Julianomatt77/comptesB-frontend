import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
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

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private cookieService: CookieService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
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
