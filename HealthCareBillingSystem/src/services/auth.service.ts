import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private api: ApiService, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Only access localStorage if we're in the browser
    const storedUser = this.isBrowser ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<User> {
    return this.api.post<User>('auth/login', loginRequest).pipe(
      map(user => {
        if (user && user.token && this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('auth_token', user.token);
          this.currentUserSubject.next(user);
        }
        return user;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }
  

  register(registerRequest: RegisterRequest): Observable<User> {
    return this.api.post<User>('auth/register', registerRequest).pipe(
      map(user => {
        if (user && user.token && this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('auth_token', user.token);
          this.currentUserSubject.next(user);
        }
        return user;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth_token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('auth_token') : null;
  }
}
