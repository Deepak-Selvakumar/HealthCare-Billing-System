import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

// Mock services
const mockAuthService = {
  login: jasmine.createSpy('login').and.returnValue(of({})),
  currentUserValue: null
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.value).toEqual({ username: '', password: '' });
  });

  it('should validate form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate form as valid when filled', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should call authService.login on valid form submission', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password'
    });
  });

  it('should not call authService.login on invalid form submission', () => {
    component.loginForm.setValue({ username: '', password: '' });
    component.onSubmit();
    
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should handle login error', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));
    
    component.loginForm.setValue({ username: 'testuser', password: 'wrongpassword' });
    component.onSubmit();
    
    expect(component.error).toBe('Invalid credentials');
    expect(component.loading).toBeFalse();
  });

  it('should navigate to dashboard on successful login', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});