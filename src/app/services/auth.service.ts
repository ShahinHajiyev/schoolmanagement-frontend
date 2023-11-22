import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, NgModule, inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChildFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, catchError, map, of, tap } from 'rxjs';
import * as jwt_decode from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public apiURL = 'http://localhost:8090/api'
  static isAuthenticated: any;
  private isLoggedIn: boolean = false;



  constructor(private http: HttpClient,
    private jwtHelper: JwtHelperService) { }


  login(username: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiURL}/login`, { username, password }, { observe: 'response' })
      .pipe(
        tap((response: HttpResponse<any>) => {
          const token = response.headers.get('Authorization');
          if (token) {
            // Store the token in local storage or wherever needed
            localStorage.setItem('auth-token', token || 'nothing');
          }
        })
      );
  }

  register(username: string, password: string, neptunCode: string, email: string): Observable<any>{
     return this.http.post<any>(`${this.apiURL}/user/register`,{username, password})
  }

  logout(): void {
    localStorage.removeItem('auth-token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth-token');
  }


  isTokenExpired(): Observable<boolean> {
    const token = this.getAuthToken();

    return of(this.jwtHelper.isTokenExpired(token));
  }

  isLogged(): Observable<boolean> {
    if (this.getAuthToken() != null) {
      this.isLoggedIn = true;
    }
    return of(this.isLoggedIn);
  }

  isAdmin(adminRole: string) : boolean  {

    let isAdmin : boolean = false;
    const token: any = this.getAuthToken();
   
    const decodedToken: any = jwt_decode.jwtDecode(token)
    let roleObjectFromToken = decodedToken.authorities.find((auth: { authority: string; }) => auth.authority === 'ROLE_ADMIN');
    let roleFromToken = roleObjectFromToken ? roleObjectFromToken.authority : null;

      if (roleFromToken === adminRole){
        return isAdmin = true;
      }
    
    return isAdmin;
  }

}


export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  return authService.isLogged().pipe(
    map((loggedIn) => {
      if (loggedIn) {

        const token = localStorage.getItem('auth-token');

        if (token) {
          const decodedToken: any = jwt_decode.jwtDecode(token)    
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            router.navigate(['login']);
            return false;
          }
        }

        return true;
      }
      else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

export const canActivateChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => canActivate(route, state);


