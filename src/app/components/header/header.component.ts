import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn!: boolean;
  username: string = '';
  authenticatedSubject!: Subscription;

  userId!: string;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private cookieService: CookieService,
    private router: Router
  ) {
    this.userId = this.cookieService.get('userId');
  }

  ngOnInit(): void {
    // console.log(this.userId);
    // if (this.userId) {
    //   this.isLoggedIn = true;
    // }
    // console.log(this.isLoggedIn);
    // this.userId = this.cookieService.get('userId');

    this.authenticatedSubject =
      this.authService.isAuthenticatedSubject.subscribe((data) => {
        this.isLoggedIn = !!data;
      });
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.username = this.storageService.getUser().username;
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('');
    });
    sessionStorage.removeItem('auth-user');
    this.isLoggedIn = false;
    this.username = '';
  }

  ngOnDestroy(): void {
    this.authenticatedSubject.unsubscribe();
  }
}
