import { NgModule } from '@angular/core';
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
import { ViewOrEditComponent } from './components/view-or-edit/view-or-edit.component';
import { OperationFormComponent } from './components/operation-form/operation-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DefaultComponent,
    ErrorComponent,
    ComptesComponent,
    LoginComponent,
    ViewOrEditComponent,
    OperationFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
