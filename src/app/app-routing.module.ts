import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComptesComponent } from './pages/comptes/comptes.component';
import { DefaultComponent } from './pages/default/default.component';
import { ErrorComponent } from './pages/error/error.component';
import { LoginComponent } from './pages/login/login.component';
import { RecapComponent } from './pages/recap/recap.component';
import { RegisterComponent } from './pages/register/register.component';
import { IsLoggedInGuardGuard } from './guards/is-logged-in-guard.guard';
import { GestionUserComponent } from './pages/gestion-user/gestion-user.component';
import { CguComponent } from './pages/cgu/cgu.component';

const routes: Routes = [
  { path: '', component: DefaultComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cgu', component: CguComponent },
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
    path: 'gestionUser',
    canActivate: [IsLoggedInGuardGuard],
    component: GestionUserComponent,
  },
  { path: 'not-found', component: ErrorComponent },
  { path: '404', redirectTo: 'not-found' },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
