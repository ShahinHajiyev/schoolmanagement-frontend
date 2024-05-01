import { NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms'
import { HTTP_INTERCEPTORS, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { CourseComponent } from './components/course/course.component';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { AdminComponent } from './components/admin/admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginValidatorComponent } from './components/login-validator/login-validator.component';
import { EnrollmentComponent } from './components/enrollment/enrollment.component';






@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CourseComponent,
    AdminComponent,
    DashboardComponent,
    SidebarComponent,
    LoginValidatorComponent,
    EnrollmentComponent
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
    JwtHelperService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule{
  
 }
