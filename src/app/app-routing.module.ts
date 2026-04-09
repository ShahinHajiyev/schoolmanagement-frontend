import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CourseComponent } from './components/course/course.component';
import { canActivateChild, canDeactivateGuard } from './services/auth.service';
import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginValidatorComponent } from './components/login-validator/login-validator.component';
import { EnrollmentComponent } from './components/enrollment/enrollment.component';
import { RegistercoursesComponent } from './components/registercourses/registercourses.component';
import { CoursedetailsComponent } from './components/coursedetails/coursedetails.component';
import { StudentsComponent } from './components/students/students.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { GradesComponent } from './components/grades/grades.component';


const routes: Routes = [

  // Public routes — no JWT required
  { path: 'login', component: LoginComponent },
  { path: 'login-validator', component: LoginValidatorComponent },

  // Protected routes — canActivateChild checks JWT on every child navigation
  {
    path: '',
    canActivateChild: [canActivateChild],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     component: DashboardComponent,        canDeactivate: [canDeactivateGuard] },
      { path: 'course',        component: CourseComponent,           canDeactivate: [canDeactivateGuard] },
      { path: 'enrollment',    component: EnrollmentComponent },
      { path: 'register/:courseId',     component: RegistercoursesComponent,  canDeactivate: [canDeactivateGuard] },
      { path: 'courseDetails/:courseId', component: CoursedetailsComponent,   canDeactivate: [canDeactivateGuard] },
      { path: 'admin',         component: AdminComponent,            canDeactivate: [canDeactivateGuard] },
      { path: 'students',      component: StudentsComponent },
      { path: 'schedule',      component: ScheduleComponent },
      { path: 'grades',        component: GradesComponent },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
