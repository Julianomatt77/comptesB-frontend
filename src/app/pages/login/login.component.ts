import {Component, OnInit, Renderer2, DOCUMENT, inject, ChangeDetectionStrategy, signal} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, NgClass, FaIconComponent, RouterLink]
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  private storageService = inject(StorageService);
  private cookieService = inject(CookieService);
  private router = inject(Router);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  form: any = {
    username: null,
    password: null,
  };
  isLoggedIn = signal(false);
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
      this.isLoggedIn.set(true);
      this.username = this.storageService.getUser().username;
    }
  }

  async onSubmit(): Promise<void> {
    const username = this.form.username.toLowerCase();
    const password = this.form.password;

    try {
      await this.authService.login(username, password)
      if (this.authService.isAuthenticated()){
        this.storageService.getUser()
        this.isLoggedIn.set(true);
        setTimeout(() => {
          this.router.navigateByUrl('/comptes');
          this.storageService.getUser()
        }, 2000);
      } else {
        this.isLoginFailed = true;
      }
    } catch (e: any) {
      console.error(e.error.message)
      this.errorMessage = e.error.message;
    }
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
