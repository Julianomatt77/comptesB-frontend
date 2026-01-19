import {Component, OnInit, inject, ChangeDetectionStrategy} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  faHouseChimney,
  faUser,
  faUserPen,
  faUserSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, FaIconComponent, MatButton]
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private cookieService = inject(CookieService);
  private router = inject(Router);

  isLoggedIn!: boolean;
  username: string = '';
  authenticatedSubject!: Subscription;

  userId!: string;

  faUser = faUser;
  faUserPen = faUserPen;
  faUserSlash = faUserSlash;
  faHouseChimney = faHouseChimney;

  constructor() {
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
