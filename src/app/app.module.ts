import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { DefaultComponent } from './components/default/default.component';
import { ErrorComponent } from './components/error/error.component';
import { ComptesComponent } from './components/comptes/comptes.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OperationFormComponent } from './components/operation-form/operation-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { registerLocaleData } from '@angular/common';
import * as fr from '@angular/common/locales/fr';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DatepickerModule } from 'ng2-datepicker';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { Daterangepicker } from 'ng2-daterangepicker';
// import { CookieService } from 'ngx-cookie-service';
import { RegisterComponent } from './components/register/register.component';
import { tokenInterceptor } from './token.interceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RecapComponent } from './components/recap/recap.component';
import { DepensesCommunesComponent } from './components/depenses-communes/depenses-communes.component';
import { OpcommuneFormComponent } from './components/opcommune-form/opcommune-form.component';
import { OpcommuneuserFormComponent } from './components/opcommuneuser-form/opcommuneuser-form.component';
import { MaterialExampleModule } from '../material.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FooterComponent } from './components/footer/footer.component';
import { GestionUserComponent } from './components/gestion-user/gestion-user.component';
import { CguComponent } from './components/cgu/cgu.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DefaultComponent,
    ErrorComponent,
    ComptesComponent,
    LoginComponent,
    OperationFormComponent,
    CompteFormComponent,
    DatePickerComponent,
    RegisterComponent,
    RecapComponent,
    DepensesCommunesComponent,
    OpcommuneFormComponent,
    OpcommuneuserFormComponent,
    FooterComponent,
    GestionUserComponent,
    CguComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    DatepickerModule,
    Daterangepicker,
    FontAwesomeModule,
    FontAwesomeModule,
    MaterialExampleModule,
    NgxChartsModule,
    // CookieService,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }, tokenInterceptor],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    registerLocaleData(fr.default);
  }
}
