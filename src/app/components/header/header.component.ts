import {Component, inject, ChangeDetectionStrategy, computed, signal} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';
import {
  faHouseChimney,
  faUser,
  faUserPen,
  faUserSlash,
  faBars, faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, FaIconComponent]
})
export class HeaderComponent {
  authService = inject(AuthService);
  storageService = inject(StorageService);
  private cookieService = inject(CookieService);
  private router = inject(Router);


  username: string = '';

  faUser = faUser;
  faUserPen = faUserPen;
  faUserSlash = faUserSlash;
  faHouseChimney = faHouseChimney;
  faBars = faBars;
  faXmark = faXmark;

  isLoggedIn = this.authService.isAuthenticated;

  readonly mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update((mobileMenuOpen) => !mobileMenuOpen);
  }

  ngOnInit(): void {
    this.authService.initFromCookies();
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('');
    });
    // sessionStorage.removeItem('auth-user');
    // this.username = '';
  }
}
