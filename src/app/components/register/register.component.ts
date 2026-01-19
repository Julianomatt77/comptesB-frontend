import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [FormsModule, NgClass, FaIconComponent]
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  form: any = {
    username: null,
    email: null,
    password: null,
    confirmPassword: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  isPasswordConfirmed = false;
  errorList: Array<string> = [];

  passwordFieldType: string = 'password';
  passwordFieldIcon = faEyeSlash;

  ngOnInit(): void {}

  onSubmit(): void {
    this.errorList = []
    const username = this.form.username.toLowerCase();
    const email = this.form.email.toLowerCase();
    const password = this.form.password;
    // const { username, email, password } = this.form;

    this.validatePasswordsMatch()

    if (this.isPasswordConfirmed){
      console.log(this.isPasswordConfirmed)
      this.authService.register(username, email, password).subscribe({
        next: (data) => {
          this.isSuccessful = true;
          this.isSignUpFailed = false;

          // Redirection après register
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1000);
        },
        error: (err) => {
          const errors = err.error.error.errors;
          for (let key in errors) {
            if (errors[key].message) {
              this.errorList.push(errors[key].message);
            }
          }
          this.isSignUpFailed = true;
        },
      });
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

  validatePasswordsMatch(): void {
    const passwordControl = this.form.password;
    const confirmPasswordControl = this.form.confirmPassword;

    if (passwordControl && confirmPasswordControl) {
      if (passwordControl !== confirmPasswordControl) {
        this.isPasswordConfirmed = false
      } else {
        this.isPasswordConfirmed = true
      }
    }
  }
}
