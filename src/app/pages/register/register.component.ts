import {Component, OnInit, inject, ChangeDetectionStrategy} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { firstValueFrom } from 'rxjs';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FaIconComponent, RouterLink]
})
export class RegisterComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  form: any = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  isLoggedIn = false;
  isRegistered = false;
  errorMessage = '';
  passwordFieldType: string = 'password';
  passwordFieldIcon = faEyeSlash;

  constructor() {}

  ngOnInit(): void {
    // Estimation: use AuthService to know if user is logged in (via local storage/session)
    // If storage service exists in the app context, you can check it similarly to LoginComponent
    // For now, rely on auth status through subscribe/endpoint after login/signup; keep simple
  }

  async onSubmit(): Promise<void> {
    const username = this.form.username.toLowerCase();
    const email = this.form.email;
    const password = this.form.password;
    if (password !== this.form.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }
    try {
      const data = await firstValueFrom(this.authService.register(username, email, password));
      if (data) {
        this.isRegistered = true;
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 1500);
      }
    } catch (e: any) {
      this.errorMessage = e?.error?.message ?? 'Erreur d’enregistrement';
    }
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
