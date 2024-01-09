import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, NgModule, inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router, CanActivateChildFn, ActivatedRoute, CanDeactivateFn, UrlTree, NavigationEnd, NavigationStart, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, Subject, catchError, map, of, tap } from 'rxjs';




import * as jwt_decode from 'jwt-decode';




@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public apiURL = 'http://localhost:8090/api'
  static isAuthenticated: any;
  private isLoggedIn: boolean = false;
  public isLogoutInProcess: boolean = false;
  adminRole: string = "ROLE_ADMIN";

  currentPath: string | undefined;
  currentRoute: string = '';

 
  private loaderSubject = new BehaviorSubject<boolean>(false);
  loaderState = this.loaderSubject.asObservable();

  constructor(private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.currentRoute = event.url;
      }
    });

    this.activatedRoute.url.subscribe((segments) => {

      this.currentPath = segments[0] ? segments[0].path : '';  //this one does not work
      console.log("WHAT IS THE CURRENT PATH: ", this.currentPath);
    })

  }


  login(neptunCode: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiURL}/login`, { neptunCode, password }, { observe: 'response' })
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

  register(password: string, confirmPassword: string, neptunCode: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/user/register`, { password, neptunCode, email })
  }

  logout(): void {
    this.isLogoutInProcess = true;
    localStorage.removeItem('auth-token');
    this.isLoggedIn = false;
  }

  completeLogout() {
    this.isLogoutInProcess = false;
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

  isAdmin(adminRole: string): boolean {
    console.log("Auth service isAdmin() ")
    let isAdmin: boolean = false;

    console.log("Auth-token ", this.getAuthToken())

    if (this.getAuthToken() != null) {
      console.log("Auth service IF isAdmin() ")
      const token: any = this.getAuthToken();
      const decodedToken: any = jwt_decode.jwtDecode(token)
      let roleObjectFromToken = decodedToken.authorities.find((auth: { authority: string; }) => auth.authority === 'ROLE_ADMIN');
      let roleFromToken = roleObjectFromToken ? roleObjectFromToken.authority : null;

      console.log("The role", roleFromToken)

      if (roleFromToken === adminRole) {
        console.log("role=admin")
        return isAdmin = true;
      }
    }
    console.log("reole=user")
    return isAdmin;
  }

  showSideBar() {
    this.loaderSubject.next(true);
    localStorage.setItem('isLoggedIn', "true");
  }

  getSideBarToken(){
  return localStorage.getItem("isLoggedIn");
  }

  hideSideBar() {
    console.log("Sidebar in authservice hided")
    this.loaderSubject.next(false);
    localStorage.removeItem("isLoggedIn");
  }

  

}




export type CanDeactivateType = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;


export interface CanComponentDeactivate {
  canDeactivate: (currentState: RouterStateSnapshot, next: RouterStateSnapshot) => CanDeactivateType;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  next: RouterStateSnapshot): CanDeactivateType => {

  if (component.canDeactivate) {
    return component.canDeactivate(currentState, next);
  }

  return true;

}

export const canActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const path = state.url;



  return authService.isLogged().pipe(
    map((loggedIn) => {
      if (loggedIn) {

        console.log("TEST: state.root: ", state.root, "state.url: ", state.url, "route.parent: ", route.parent)


        const token = localStorage.getItem('auth-token');
        
        let currentUrl = router.url;
        let nextPath = authService.currentRoute;
        console.log("Current url", currentUrl)
        console.log("Current path", authService.currentPath)
        console.log("MAVIGATED--------- path", nextPath)
        //let isItAdmin: boolean  = this.isAdmin();




        if (token) {
          const decodedToken: any = jwt_decode.jwtDecode(token)
          const currentTime = Math.floor(Date.now() / 1000);

          console.log("If token")

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            router.navigate(['login']);
            return false;
          }

          if (authService.isAdmin(authService.adminRole) != true && state.url.includes('/admin')) {
            console.log("Can activate adminrole")
            router.navigate(['course'])
            return false;
          }
        }

      
        return true;
      }

      else {
        router.navigate(['/login']);
        return false;
      }

    }

    ),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  )
};

export const canActivateChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => canActivate(route, state);




