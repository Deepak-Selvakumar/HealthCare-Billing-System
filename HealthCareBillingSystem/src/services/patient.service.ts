// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Patient } from '../interfaces/patient';
import { environment } from '../environments/environment'; // ✅ Import environment

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/Patient`; // ✅ Set base URL

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}) // ✅ Add only if token exists
    });
  }

  getPatients(type: string = 'all'): Observable<Patient[]> {
    return this.http.get<any>(`${this.apiUrl}/PatientList/${type}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response && response.value) {
            return response.value.map((patient: any) => ({
              id: patient.id,
              name: `${patient.firstName} ${patient.lastName}`,
              firstName: patient.firstName,
              lastName: patient.lastName,
              age: this.calculateAge(patient.dateOfBirth),
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender || 'Unknown',
              phone: patient.phone,
              email: patient.email,
              address: patient.address,
              insuranceProvider: patient.insuranceProvider,
              insurancePolicyNumber: patient.insurancePolicyNumber
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching patients:', error);
          return throwError(() => new Error('Failed to fetch patients'));
        })
      );
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching patient:', error);
          return throwError(() => new Error('Failed to fetch patient'));
        })
      );
  }

  createPatient(patient: Patient): Observable<any> {
    return this.http.post(`${this.apiUrl}`, patient, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error creating patient:', error);
          return throwError(() => new Error('Failed to create patient'));
        })
      );
  }

  updatePatient(id: number, patient: Patient): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, patient, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error updating patient:', error);
          return throwError(() => new Error('Failed to update patient'));
        })
      );
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error deleting patient:', error);
          return throwError(() => new Error('Failed to delete patient'));
        })
      );
  }

  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
