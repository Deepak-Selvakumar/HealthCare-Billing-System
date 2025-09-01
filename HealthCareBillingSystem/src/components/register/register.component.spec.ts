import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

// Mock services
const mockAuthService = {
  register: jasmine.createSpy('register').and.returnValue(of({})),
  currentUserValue: null,
  isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false)
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.value).toEqual({ 
      username: '', 
      email: '', 
      password: '',
      role: 'User'
    });
  });

  it('should validate form as invalid when empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should validate form as valid when filled', () => {
    component.registerForm.setValue({ 
      username: 'johndoe', 
      email: 'john@example.com', 
      password: 'password123',
      role: 'User'
    });
    expect(component.registerForm.valid).toBeTrue();
  });

  it('should call authService.register on valid form submission', () => {
    component.registerForm.setValue({ 
      username: 'johndoe', 
      email: 'john@example.com', 
      password: 'password123',
      role: 'User'
    });
    component.onSubmit();
    
    expect(authService.register).toHaveBeenCalledWith({       
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      role: 'User'
    });
  });

  it('should not call authService.register on invalid form submission', () => {
    component.registerForm.setValue({  
      username: '', 
      email: '', 
      password: '',
      role: ''
    });
    component.onSubmit();
    
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should handle registration error', () => {
    const errorResponse = { error: { message: 'Username already exists' } };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));
    
    component.registerForm.setValue({  
      username: 'johndoe', 
      email: 'john@example.com', 
      password: 'password123',
      role: 'User'
    });
    component.onSubmit();
    
    expect(component.error).toBe('Username already exists');
    expect(component.loading).toBeFalse();
  });

  it('should navigate to dashboard on successful registration', () => {
    component.registerForm.setValue({  
      username: 'johndoe', 
      email: 'john@example.com', 
      password: 'password123',
      role: 'User'
    });
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});