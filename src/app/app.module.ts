import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { CourseComponent } from './components/course/course.component';
import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginValidatorComponent } from './components/login-validator/login-validator.component';
import { EnrollmentComponent } from './components/enrollment/enrollment.component';
import { RegistercoursesComponent } from './components/registercourses/registercourses.component';
import { CoursedetailsComponent } from './components/coursedetails/coursedetails.component';
import { StudentsComponent } from './components/students/students.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { GradesComponent } from './components/grades/grades.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TeacherComponent } from './components/teacher/teacher.component';
import { TrainingComponent } from './components/training/training.component';

import { AuthInterceptor } from './services/auth.interceptor';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CourseComponent,
    AdminComponent,
    DashboardComponent,
    SidebarComponent,
    LoginValidatorComponent,
    EnrollmentComponent,
    RegistercoursesComponent,
    CoursedetailsComponent,
    StudentsComponent,
    ScheduleComponent,
    GradesComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    TeacherComponent,
    TrainingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: JWT_OPTIONS, useValue: {} },
    JwtHelperService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
