import {Component, OnInit, DOCUMENT, inject, ChangeDetectionStrategy} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HostBinding, Renderer2 } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit {
  private cookieService = inject(CookieService);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  consent: boolean = false;

  constructor() {
    this.renderer.addClass(this.document.body, 'bg-light');
    let cookieConsent = this.cookieService.get('cookieConsent');

    if (cookieConsent) {
      this.consent = true;
    }
  }

  ngOnInit(): void {}

  userConsent() {
    this.cookieService.set(
      'cookieConsent',
      'Yes',
      0.2,
      '/',
      undefined,
      false,
      'Strict'
    );

    this.consent = true;
  }
}
