import { Component, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'JM-comptesB';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.titleService.setTitle('JM-comptesB');

    this.metaService.addTags([
      {
        name: 'title',
        content: 'JM-comptesB',
      },
      {
        name: 'author',
        content: 'Julien MARTIN',
      },
      {
        name: 'description',
        content: 'Application de gestion de comptes bancaires',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        property: 'og:title',
        content: 'JM-comptesB',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:description',
        content: 'Application de gestion de comptes bancaires',
      },
      {
        property: 'og:url',
        content: 'https://www.martin-julien-dev.fr',
      },
    ]);
  }

  ngOnInit() {
    this.document.documentElement.lang = 'fr';
  }
}
