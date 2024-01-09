import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CourseComponent } from './components/course/course.component';
import { canActivate, canDeactivateGuard } from './services/auth.service';
import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';



const routes: Routes = [
  
  {path: 'course', component: CourseComponent,  canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: 'login',  component: LoginComponent },
  {path: 'dashboard', component: DashboardComponent, canActivate: [canActivate]},
  {path: 'admin', component: AdminComponent, canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: '', redirectTo: '/login', pathMatch: 'full'}

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
