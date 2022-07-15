import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ComptesComponent } from './components/comptes/comptes.component';
import { DefaultComponent } from './components/default/default.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  // { path: '', component: AppComponent },
  { path: '', component: DefaultComponent },
  { path: 'login', component: LoginComponent },
  { path: 'comptes', component: ComptesComponent },
  { path: 'not-found', component: ErrorComponent },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
