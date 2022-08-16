import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ComptesComponent } from './components/comptes/comptes.component';
import { DefaultComponent } from './components/default/default.component';
import { DepensesCommunesComponent } from './components/depenses-communes/depenses-communes.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginComponent } from './components/login/login.component';
import { RecapComponent } from './components/recap/recap.component';
import { RegisterComponent } from './components/register/register.component';
import { IsLoggedInGuardGuard } from './guards/is-logged-in-guard.guard';

const routes: Routes = [
  // { path: '', component: AppComponent },
  { path: '', component: DefaultComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'comptes',
    canActivate: [IsLoggedInGuardGuard],
    component: ComptesComponent,
  },
  {
    path: 'recap',
    canActivate: [IsLoggedInGuardGuard],
    component: RecapComponent,
  },
  {
    path: 'depensesCommunes',
    canActivate: [IsLoggedInGuardGuard],
    component: DepensesCommunesComponent,
  },
  { path: 'not-found', component: ErrorComponent },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
