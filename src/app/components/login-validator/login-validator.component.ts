import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, CanComponentDeactivate, CanDeactivateType, sharedCanDeactivate } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-validator',
  templateUrl: './login-validator.component.html',
  styleUrls: ['./login-validator.component.css']
})
export class LoginValidatorComponent implements OnInit, CanComponentDeactivate {

  activationForm!: FormGroup;
  activationState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  errorMessage: string | null = null;
  resendState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  resendErrorMessage: string | null = null;

  // I8: neptunCode read from query param — not from a mutable service field
  readonly neptunCode: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    this.neptunCode = (route.snapshot.queryParamMap.get('neptunCode') ?? '').toUpperCase();
  }

  ngOnInit(): void {
    this.activationForm = new FormGroup({
      activationCode: new FormControl('', [Validators.required])
    });
  }

  canDeactivate(_currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): CanDeactivateType {
    return sharedCanDeactivate(this.authService, nextState);
  }

  resendCode(): void {
    if (this.resendState === 'loading') return;
    this.resendState = 'loading';
    this.resendErrorMessage = null;
    this.authService.resendActivationCode(this.neptunCode)
      .pipe(take(1))
      .subscribe({
        next: () => { this.resendState = 'success'; },
        error: (e: HttpErrorResponse) => {
          this.resendState = 'error';
          this.resendErrorMessage = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }

  activateAccount(): void {
    if (this.activationForm.invalid || this.activationState === 'loading') return;
    this.activationState = 'loading';
    this.errorMessage = null;
    this.authService.activateAccount(
      this.activationForm.value.activationCode,
      this.neptunCode
    ).pipe(take(1)).subscribe({
      next: () => {
        this.activationState = 'success';
      },
      error: (e: HttpErrorResponse) => {
        this.activationState = 'error';
        this.errorMessage = e.error?.message ?? null;
        this.activationForm.get('activationCode')?.reset();
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
