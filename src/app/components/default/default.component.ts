import { Component, OnInit, Renderer2, DOCUMENT, inject } from '@angular/core';

import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { CompteService } from 'src/app/services/compte.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-default',
    templateUrl: './default.component.html',
    styleUrls: ['./default.component.css'],
    imports: [RouterLink]
})
export class DefaultComponent implements OnInit {
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private compteService = inject(CompteService);

  isLoggedIn!: boolean;
  authenticatedSubject!: Subscription;

  constructor() {
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
