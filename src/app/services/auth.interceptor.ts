import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http'
import { EMPTY, Observable, catchError, tap } from 'rxjs'
import { AuthService } from './auth.service';
import { Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {


  constructor(private authService: AuthService,
    private router: Router) { }

    


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { //this observable added here    
    const authToken = this.authService.getAuthToken();
    

    if (authToken && this.authService.isTokenExpired()) {
      console.log("DOUBLE ESPRESSO")
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
      console.log("Inside Interceptor")

      return next.handle(authReq);
    }


    this.router.navigate(['/login'])
     return next.handle(req)
  }
}

