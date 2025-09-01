import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Generic GET method
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { 
      headers: this.getHeaders(),
      params: this.toHttpParams(params)
    }).pipe(
      retry(1), // Retry once before failing
      catchError(this.handleError)
    );
  }

  // Generic POST method
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Generic PUT method
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Generic PATCH method
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Generic DELETE method
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Upload file with progress reporting
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, formData, {
      headers: this.getUploadHeaders(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  // Download file
  download(endpoint: string, params?: any): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params: this.toHttpParams(params),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (this.isBrowser) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private getUploadHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    if (this.isBrowser) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private toHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.append(key, value.toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Add more specific error messages based on status code
      switch (error.status) {
        case 0:
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = 'Bad Request: The server could not understand the request.';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again.';
          // Optional: Clear token and redirect to login
          if (this.isBrowser) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later.';
          break;
      }
      
      // Include server error message if available
      if (error.error && error.error.message) {
        errorMessage += `\nServer Message: ${error.error.message}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Helper method to get auth token
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('auth_token') : null;
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return this.isBrowser ? !!localStorage.getItem('auth_token') : false;
  }

  // Clear authentication data
  clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
    }
  }
}