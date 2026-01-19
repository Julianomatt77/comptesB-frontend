import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { CompteService } from 'src/app/services/compte.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-default',
    templateUrl: './default.component.html',
    styleUrls: ['./default.component.css'],
    imports: [NgIf, RouterLink]
})
export class DefaultComponent implements OnInit {
  isLoggedIn!: boolean;
  authenticatedSubject!: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private authService: AuthService,
    private storageService: StorageService,
    private compteService: CompteService
  ) {
    this.renderer.addClass(this.document.body, 'bg-light');
  }

  ngOnInit(): void {
    this.authenticatedSubject =
      this.authService.isAuthenticatedSubject.subscribe((data) => {
        this.isLoggedIn = !!data;
      });
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
    }
    this.compteService.getAllAccounts();
  }

  ngOnDestroy(): void {
    this.authenticatedSubject.unsubscribe();
  }
}
