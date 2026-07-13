import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Simulate recovery email submission
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Password recovery link has been sent to your email address.';
    }, 1200);
  }
}
