import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../interfaces/patient';
import { AddPatientDialogComponent } from '../add-patient-dialog/add-patient-dialog.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class PatientListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'age', 'gender', 'phone', 'actions'];
  dataSource: Patient[] = [];
  loading = false;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getPatients('all').subscribe({
      next: (patients) => {
        this.dataSource = patients;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading patients: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  openAddPatientDialog(): void {
    const dialogRef = this.dialog.open(AddPatientDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPatients();
      }
    });
  }

  deletePatient(patient: Patient): void {
    if (confirm(`Are you sure you want to delete ${patient.name}?`)) {
      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.snackBar.open('Patient deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPatients();
        },
        error: (error) => {
          this.snackBar.open('Error deleting patient: ' + error.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}