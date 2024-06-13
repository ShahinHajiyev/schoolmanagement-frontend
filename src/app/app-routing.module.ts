import { NgModule,  inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CourseComponent } from './components/course/course.component';
import { canActivate, canDeactivateGuard } from './services/auth.service';
import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginValidatorComponent } from './components/login-validator/login-validator.component';
import { EnrollmentComponent } from './components/enrollment/enrollment.component';
import { RegistercoursesComponent } from './components/registercourses/registercourses.component';
import { CoursedetailsComponent } from './components/coursedetails/coursedetails.component';



const routes: Routes = [
  
  {path: 'course', component: CourseComponent,  canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: 'register/:courseId', component: RegistercoursesComponent,  canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: 'courseDetails/:courseId', component: CoursedetailsComponent,  canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: 'login',  component: LoginComponent },
  {path: 'enrollment',  component: EnrollmentComponent, canActivate: [canActivate] },
  {path: 'login-validator',  component: LoginValidatorComponent ,  canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [canActivate]},
  {path: 'admin', component: AdminComponent, canActivate: [canActivate], canDeactivate: [canDeactivateGuard]},
  {path: '', redirectTo: '/login', pathMatch: 'full'}

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
