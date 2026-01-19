import { enableProdMode, LOCALE_ID, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import localeFr from '@angular/common/locales/fr';

import { environment } from './environments/environment';
import { tokenInterceptor } from './app/token.interceptor';
import {LocationStrategy, HashLocationStrategy, registerLocaleData} from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}
registerLocaleData(localeFr);
bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatTableModule, MatPaginatorModule, FontAwesomeModule, FontAwesomeModule, NgxChartsModule),
        { provide: LOCALE_ID, useValue: 'fr-FR' }, tokenInterceptor,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
