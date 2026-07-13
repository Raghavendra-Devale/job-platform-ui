import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.successMessage = 'Signing you in...';
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) {
          this.errorMessage = "We're having trouble connecting. Please try again shortly.";
        } else {
          this.errorMessage = 'Incorrect email or password.';
        }
      }
    });
  }
}
