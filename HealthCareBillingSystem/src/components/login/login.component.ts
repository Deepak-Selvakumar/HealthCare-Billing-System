import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/user';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatError,
    MatSnackBarModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // if already logged in, redirect
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onRegisterClick(): void {  
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
 

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  getUsernameErrorMessage(): string {
    if (this.f['username'].hasError('required')) {
      return 'Username is required';
    }
    if (this.f['username'].hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.f['password'].hasError('required')) {
      return 'Password is required';
    }
    if (this.f['password'].hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
  onSubmit(): void {
  this.submitted = true;

  if (this.loginForm.invalid) {
    return;
  }

  this.loading = true;
  this.error = null;

  const loginRequest: LoginRequest = {
    username: this.f['username'].value,
    password: this.f['password'].value
  };

  this.authService.login(loginRequest)
    .pipe(first())
    .subscribe({
      next: (user) => {
        this.loading = false;
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Get return url from route parameters or default to '/dashboard'
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        
        // Handle different types of errors
        if (err.status === 401) {
          this.error = 'Invalid username or password';
        } else if (err.status === 0) {
          this.error = 'Unable to connect to server. Please check your connection.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Login failed. Please try again.';
        }

        this.snackBar.open(this.error ?? 'Login failed. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
}
}