import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HostBinding, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  consent: boolean = false;

  constructor(
    private cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
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
