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
  errorStatus: number | null = null;
  isLoading = false;
  resendState: 'idle' | 'loading' | 'success' | 'error' = 'idle';

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
    this.authService.resendActivationCode(this.neptunCode)
      .pipe(take(1))
      .subscribe({
        next: () => { this.resendState = 'success'; },
        error: () => { this.resendState = 'error'; }
      });
  }

  activateAccount(): void {
    if (this.activationForm.invalid || this.isLoading) return;
    this.isLoading = true;
    this.authService.activateAccount(
      this.activationForm.value.activationCode,
      this.neptunCode
    ).pipe(take(1)).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (e: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorStatus = e.status;
      }
    });
  }
}
