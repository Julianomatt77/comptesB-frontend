import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  consent: boolean = false;

  constructor(private cookieService: CookieService) {
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
