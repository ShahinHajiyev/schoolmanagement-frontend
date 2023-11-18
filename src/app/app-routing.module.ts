import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CourseComponent } from './components/course/course.component';
import { canActivate } from './services/auth.service';
import { AdminComponent } from './components/admin/admin.component';



const routes: Routes = [
  
  {path: 'course', component: CourseComponent, canActivate: [canActivate]},
  {path: 'login', component: LoginComponent },
  {path: 'course', component: CourseComponent},
  {path: 'admin', component: AdminComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'}

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
