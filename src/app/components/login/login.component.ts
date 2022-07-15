import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username!: string;
  password!: string;
  errMsg!: string;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onSubmitAuthForm(): void {
    //reset errMsg
    // this.errMsg = '';
    // this.authService
    //   .signIn(this.username, this.password)
    //   .then(() => {
    //     //redirect user to series view
    //     this.router.navigateByUrl('/series');
    //   })
    //   .catch((errMsg) => {
    //     //If wrong logins, display en error message
    //     this.errMsg = errMsg;
    //   });
  }
}
