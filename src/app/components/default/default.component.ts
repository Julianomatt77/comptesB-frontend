import {Component, OnInit, Renderer2, DOCUMENT, inject, ChangeDetectionStrategy, computed} from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { CompteService } from 'src/app/services/compte.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-default',
    templateUrl: './default.component.html',
    styleUrls: ['./default.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink]
})
export class DefaultComponent implements OnInit {
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private compteService = inject(CompteService);

  isLoggedIn = computed(() => {
    return this.authService.isAuthenticated() || this.storageService.isLoggedIn();
  });

  constructor() {
    this.renderer.addClass(this.document.body, 'bg-light');
  }

  ngOnInit(): void {
    this.compteService.getAllAccounts();
  }
}
