import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http'
import { Observable, tap } from 'rxjs'
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {


  constructor(private authService: AuthService) { }
 

   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { //this observable added here    
    const authToken = this.authService.getAuthToken();

    if (authToken) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
      console.log("Inside Interceptor")
     
      return next.handle(authReq);
    }


    return next.handle(req);
  }                    
}

