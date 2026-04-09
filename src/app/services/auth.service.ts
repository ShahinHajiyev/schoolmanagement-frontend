import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn, ActivatedRouteSnapshot, Router, CanActivateChildFn,
  CanDeactivateFn, UrlTree, RouterStateSnapshot
} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import * as jwt_decode from 'jwt-decode';

import { LocalStorageService } from './local-storage.service';
import { JwtPayload } from '../interfaces/jwt-payload';
import { environment } from 'src/environments/environment';

const AUTH_TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly apiUrl = environment.apiUrl;
  readonly adminRole = 'ROLE_ADMIN';

  // I6: private backing field — read-only to outside via getter
  private logoutInProcess = false;

  // I4: initialized with the real value so BehaviorSubject never emits a wrong initial state
  private isTokenExpiredSubject = new BehaviorSubject<boolean>(this.isTokenExpiredSync());

  /** Emits true when a valid, non-expired token exists. Safe to use with async pipe. */
  readonly isLoggedIn$ = this.isTokenExpiredSubject.pipe(map(expired => !expired));

  private expiryTimer: ReturnType<typeof setTimeout> | null = null;
  private inactivityDuration = 0;
  private lastStorageUpdate = 0;
  private listenersActive = false;
  private readonly activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  private readonly boundActivityHandler = () => this.onUserActivity();

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService,
    private localStorageService: LocalStorageService
  ) {}

  // ─── Error handling ──────────────────────────────────────────────────────────

  // I6: private — only used inside this service
  private handleError(error?: HttpErrorResponse): Observable<never> {
    if (error) {
      if (error.status === 0) {
        console.error('Network error:', error.message);
      } else {
        console.error(`HTTP ${error.status}:`, error.message);
      }
    }
    return throwError(() => error);
  }

  // ─── Token management ────────────────────────────────────────────────────────

  getAuthToken(): string | null {
    return this.localStorageService.get<string>(AUTH_TOKEN_KEY);
  }

  /**
   * Stores the JWT using the token's own exp claim as expiry — no manual override.
   * I5: strips "Bearer " prefix if the backend includes it in the Authorization header.
   */
  setOrUpdateAuthToken(rawToken: string): void {
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
    this.inactivityDuration = 1000 * 1000; // TEST: 10-second inactivity window
    this.storeToken(token);
    this.refreshExpiredState();
    this.startActivityListeners();
    this.scheduleAutoLogout();
  }

  private storeToken(token: string): void {
    this.localStorageService.set<string>(AUTH_TOKEN_KEY, token, Date.now() + this.inactivityDuration);
    this.lastStorageUpdate = Date.now();
  }

  private scheduleAutoLogout(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = setTimeout(() => {
      this.logout();
      this.router.navigate(['/login']);
    }, this.inactivityDuration);
  }

  private onUserActivity(): void {
    this.scheduleAutoLogout();
    // Throttle localStorage update to once per second to avoid thrashing
    if (Date.now() - this.lastStorageUpdate > 1000) {
      const token = this.getAuthToken();
      if (token) this.storeToken(token);
    }
  }

  private startActivityListeners(): void {
    if (this.listenersActive) return;
    this.activityEvents.forEach(e => document.addEventListener(e, this.boundActivityHandler));
    this.listenersActive = true;
  }

  private stopActivityListeners(): void {
    this.activityEvents.forEach(e => document.removeEventListener(e, this.boundActivityHandler));
    this.listenersActive = false;
  }

  /** I4: synchronous expiry check — used to initialize the BehaviorSubject and in guards. */
  isTokenExpiredSync(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;
    return this.jwtHelper.isTokenExpired(token);
  }

  private refreshExpiredState(): void {
    this.isTokenExpiredSubject.next(this.isTokenExpiredSync());
  }

  // ─── Auth operations ─────────────────────────────────────────────────────────

  login(neptunCode: string, password: string): Observable<HttpResponse<any>> {
    this.localStorageService.remove(AUTH_TOKEN_KEY);
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      { neptunCode, password },
      { observe: 'response' }
    ).pipe(
      tap((response: HttpResponse<any>) => {
        const token = response.headers.get('Authorization');
        if (token) this.setOrUpdateAuthToken(token);
      }),
      catchError(e => this.handleError(e))
    );
  }

  register(password: string, neptunCode: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/register`, { password, neptunCode, email });
  }

  logout(): void {
    this.logoutInProcess = true;
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    this.stopActivityListeners();
    this.localStorageService.remove(AUTH_TOKEN_KEY);
    this.refreshExpiredState();
  }

  completeLogout(): void {
    this.logoutInProcess = false;
  }

  activateAccount(activationCode: string, neptunCode: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/user/activate`,
      { activationCode, neptunCode },
      { observe: 'response' }
    ).pipe(catchError(e => this.handleError(e)));
  }

  // ─── Token decoding ──────────────────────────────────────────────────────────

  decodeToken(): JwtPayload | null {
    const token = this.localStorageService.get<string>(AUTH_TOKEN_KEY);
    if (!token) return null;
    return jwt_decode.jwtDecode<JwtPayload>(token);
  }

  /** I10: synchronous — no need for an Observable wrapper around a sync operation. */
  getLoggedUserSync(): string | null {
    return this.decodeToken()?.sub ?? null;
  }

  // I7: uses this.adminRole internally — no parameter needed
  isAdmin(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) return false;
    return decoded.authorities?.some(a => a.authority === this.adminRole) ?? false;
  }

  // ─── Read-only public state ──────────────────────────────────────────────────

  // I6: getter makes isLogoutInProcess externally readable but not settable
  get isLogoutInProcess(): boolean {
    return this.logoutInProcess;
  }
}


// ─── Guard types ────────────────────────────────────────────────────────────

export type CanDeactivateType =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree;

export interface CanComponentDeactivate {
  canDeactivate: (
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) => CanDeactivateType;
}

// ─── Shared canDeactivate logic ──────────────────────────────────────────────

export function sharedCanDeactivate(
  authService: AuthService,
  nextState: RouterStateSnapshot
): CanDeactivateType {
  if (authService.isLogoutInProcess) {
    authService.completeLogout();
    return true;
  }
  if (nextState.url.includes('/login')) {
    return false;
  }
  return true;
}

// ─── Guards ──────────────────────────────────────────────────────────────────

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
  _currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot
): CanDeactivateType => {
  if (component.canDeactivate) {
    return component.canDeactivate(currentState, nextState);
  }
  return true;
};

export const canActivate: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isTokenExpiredSync()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  if (state.url.includes('/admin') && !authService.isAdmin()) {
    return router.createUrlTree(['/course']);
  }

  return true;
};

export const canActivateChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => canActivate(route, state);
