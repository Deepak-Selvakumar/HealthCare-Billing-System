import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PatientService } from '../../services/patient.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-patient-dialog',
  templateUrl: './add-patient-dialog.component.html',
  styleUrls: ['./add-patient-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinner
  ]
})
export class AddPatientDialogComponent {
  patientForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddPatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.patientForm = this.createForm();
    
    // If editing existing patient, populate form
    if (data && data.patient) {
      this.patientForm.patchValue(data.patient);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(150)]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.email]],
      address: [''],
      emergencyContact: [''],
      bloodGroup: [''],
      allergies: [''],
      medicalHistory: ['']
    });
  }

  get f() {
    return this.patientForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const patientData = this.patientForm.value;

    // Process allergies and medical history as arrays
    if (patientData.allergies) {
      patientData.allergies = patientData.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a);
    }
    if (patientData.medicalHistory) {
      patientData.medicalHistory = patientData.medicalHistory.split(',').map((m: string) => m.trim()).filter((m: string) => m);
    }

    const operation = this.data?.patient
      ? this.patientService.updatePatient(this.data.patient.id, patientData)
      : this.patientService.createPatient(patientData);

    operation.subscribe({
      next: (patient) => {
        this.loading = false;
        this.snackBar.open(
          `Patient ${this.data?.patient ? 'updated' : 'created'} successfully!`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.dialogRef.close(patient);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          `Error ${this.data?.patient ? 'updating' : 'creating'} patient: ${error.message}`,
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      this.patientForm.get(key)?.markAsTouched();
    });
  }
}