import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

const passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // I14: single union type instead of two mirrored booleans
  activeView: 'login' | 'register' = 'login';

  // I12: prevents double-submission while a request is in flight
  isLoading = false;

  errorStatus: number | null = null;

  loginForm!: FormGroup;
  registrationForm!: FormGroup;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // I11: forms always initialized first — template never sees undefined loginForm
    this.loginForm = new FormGroup({
      neptunCode: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.registrationForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      neptunCode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email])
    }, { validators: passwordMatchValidator });

    // Redirect after forms are ready so the template never crashes
    if (!this.authService.isTokenExpiredSync()) {
      this.router.navigate([this.authService.isAdmin() ? '/admin' : '/course']);
    }
  }

  login(): void {
    if (this.loginForm.invalid || this.isLoading) return;
    this.isLoading = true;
    this.errorStatus = null;

    this.authService.login(
      this.loginForm.value.neptunCode,
      this.loginForm.value.password
    ).pipe(take(1)).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/course']);
      },
      error: (e: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorStatus = e.status;
        if (e.status === 409) {
          // I8: neptunCode passed as query param — not stored on the service
          this.router.navigate(['/login-validator'], {
            queryParams: { neptunCode: this.loginForm.value.neptunCode }
          });
        }
      }
    });
  }

  register(): void {
    if (this.registrationForm.invalid || this.isLoading) return;
    this.isLoading = true;
    this.errorStatus = null;

    this.authService.register(
      this.registrationForm.value.password,
      this.registrationForm.value.neptunCode,
      this.registrationForm.value.email
    ).pipe(take(1)).subscribe({
      next: () => {
        this.isLoading = false;
        // I13: registration triggers an activation email — go straight to the validator
        this.router.navigate(['/login-validator'], {
          queryParams: { neptunCode: this.registrationForm.value.neptunCode }
        });
      },
      error: (e: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorStatus = e.status;
      }
    });
  }

  showLoginForm(): void  { this.activeView = 'login'; }
  showRegisterForm(): void { this.activeView = 'register'; }
}
