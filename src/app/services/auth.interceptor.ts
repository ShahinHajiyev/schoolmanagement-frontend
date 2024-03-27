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
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
      console.log("Inside Interceptor")

      return next.handle(authReq);
    }


    this.router.navigate(['/login'])
     return next.handle(req)//.pipe(
    //   catchError((error: HttpErrorResponse) => {
    //     if (error.error instanceof Error) {
    //       // A client-side or network error occurred. Handle it accordingly.
    //       console.error('An error occurred:', error.error.message);
    //     } else {
    //       // The backend returned an unsuccessful response code.
    //       // The response body may contain clues as to what went wrong,
    //       console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    //       console.log("INTERCEPTOR?", error.status)
    //     }

    //     // If you want to return a new response:
    //     //return of(new HttpResponse({body: [{name: "Default value..."}]}));

    //     // If you want to return the error on the upper level:
    //     //return throwError(error);

    //     // or just return nothing:
    //     return EMPTY;
    //   })
    // );
  }
}

