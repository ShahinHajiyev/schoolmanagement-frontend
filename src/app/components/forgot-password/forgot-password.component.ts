import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  submitState: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private authService: AuthService) {}

  submit(): void {
    if (this.form.invalid || this.submitState === 'loading') return;
    this.submitState = 'loading';

    this.authService.forgotPassword(this.form.value.email!)
      .subscribe({
        next: () => this.submitState = 'success',
        error: () => this.submitState = 'success' // always show generic success to avoid email enumeration
      });
  }
}
