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
    this.titleService.setTitle('Compty');

    this.metaService.addTags([
      {
        name: 'title',
        content: 'Compty',
      },
      {
        name: 'author',
        content: 'Julien MARTIN',
      },
      {
        name: 'description',
        content: 'Compty est votre nouvelle application de gestion de comptes bancaires qui vous permet de gérer toutes vos opérations quotidiennes et les exporter au format .csv très simplement.',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
      {
        property: 'og:title',
        content: 'Compty',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:description',
        content: 'Compty est votre nouvelle application de gestion de comptes bancaires qui vous permet de gérer toutes vos opérations quotidiennes et les exporter au format .csv très simplement.',
      },
      {
        property: 'og:url',
        content: 'https://jm-comptesb.martin-julien-dev.fr',
      },
      {
        property: 'og:image',
        content: 'https://jm-comptesb.martin-julien-dev.fr/assets/images/logo_compty.png'
      },
      {
        property: 'og:site_name',
        content: 'Compty'
      }
    ]);
  }

  ngOnInit() {
    this.document.documentElement.lang = 'fr';
  }
}
