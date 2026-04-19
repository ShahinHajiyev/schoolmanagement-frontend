import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

/** Routes that must never receive an Authorization header. */
const PUBLIC_PATHS = ['/login', '/user/register', '/user/activate', '/user/resend-activation', '/user/forgot-password', '/user/reset-password'];

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // I1: skip auth header for public endpoints
    const isPublic = PUBLIC_PATHS.some(path =>
      req.url.startsWith(`${environment.apiUrl}${path}`)
    );
    if (isPublic) {
      return next.handle(req);
    }

    const authToken = this.authService.getAuthToken();

    if (!authToken) {
      return next.handle(req);
    }

    // I2+I3: instead of router.navigate() (which races), throw a typed error so the
    // canActivateChild guard (which returns a UrlTree) handles the redirect cleanly,
    // and callers receive a proper error rather than silent EMPTY completion.
    // if (this.authService.isTokenExpiredSync()) {
    //   this.authService.logout();
    //   return throwError(() => ({ status: 401, message: 'Session expired' }));
    // }

    return next.handle(req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    }));
  }
}
