import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.css'],
})
export class DefaultComponent implements OnInit {
  isLoggedIn!: boolean;
  authenticatedSubject!: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private authService: AuthService,
    private storageService: StorageService
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
  }

  ngOnDestroy(): void {
    this.authenticatedSubject.unsubscribe();
  }
}
