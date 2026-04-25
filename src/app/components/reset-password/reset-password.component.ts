import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

const passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const pw  = form.get('newPassword')?.value;
  const cpw = form.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  submitState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  errorMessage: string | null = null;
  private resetToken = '';

  form = new FormGroup({
    newPassword:     new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    if (this.form.invalid || this.submitState === 'loading') return;
    this.submitState = 'loading';

    this.authService.resetPassword(this.resetToken, this.form.value.newPassword!)
      .subscribe({
        next: () => {
          this.submitState = 'success';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (e: HttpErrorResponse) => {
          this.submitState = 'error';
          this.errorMessage = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }
}
