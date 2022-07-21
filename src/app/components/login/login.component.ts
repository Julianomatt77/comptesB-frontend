import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

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

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.username = this.storageService.getUser().username;
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

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
        setTimeout(() => {
          this.router.navigateByUrl('/');
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
}
