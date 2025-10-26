import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListeEtudiantsComponent } from './components/liste-etudiants/liste-etudiants.component';
import { DetailsEtudiantComponent } from './components/details-etudiant/details-etudiant.component';
import { EtudiantFormComponent } from './components/etudiant-form/etudiant-form.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { DetailsUserComponent } from './components/details-user/details-user.component';
import { ChatComponent } from './components/chat/chat.component';
import { EtudiantResolver } from './auth/etudiant.resolver';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'user/:id', component: DetailsUserComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'etudiant', component: ListeEtudiantsComponent },
  { path: 'etudiant/new', component: EtudiantFormComponent },
  { path: 'etudiant/:id', component: DetailsEtudiantComponent, resolve: { etudiant: EtudiantResolver } }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
