import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillService } from '../../services/bill.service';
import { PatientService } from '../../services/patient.service';
import { Bill } from '../../interfaces/bill';
import { Patient } from '../../interfaces/patient';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { AddBillDialogComponent } from '../add-bill-dialog/add-bill-dialog.component';
 
@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html',
  styleUrls: ['./bill-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class BillListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'patientName', 'date', 'amount', 'status', 'actions'];
  dataSource: Bill[] = [];
  loading = false;
  patientId: string | null = null;
  patient: Patient | null = null;

  constructor(
    private billService: BillService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    
    if (this.patientId) {
      this.loadPatientDetails(this.patientId);
    }
    
    this.loadBills();
  }

  loadBills(): void {
    this.loading = true;
    
    const observable = this.patientId 
      ? this.billService.getBillsByPatient(this.patientId)
      : this.billService.getBills();

    observable.subscribe({
      next: (bills) => {
        this.dataSource = bills;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading bills: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  loadPatientDetails(patientId: string): void {
    this.patientService.getPatient(Number(patientId)).subscribe({
      next: (patient) => {
        this.patient = patient;
      },
      error: (error) => {
        this.snackBar.open('Error loading patient details: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openAddBillDialog(): void {
    const dialogRef = this.dialog.open(AddBillDialogComponent, {
      width: '500px',
      data: { patientId: this.patientId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBills();
      }
    });
  }

  deleteBill(bill: Bill): void {
    if (confirm(`Are you sure you want to delete bill #${bill.id}?`)) {
      this.billService.deleteBill(bill.id).subscribe({
        next: () => {
          this.snackBar.open('Bill deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadBills();
        },
        error: (error) => {
          this.snackBar.open('Error deleting bill: ' + error.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getTotalAmount(): number {
    return this.dataSource.reduce((total, bill) => total + bill.amount, 0);
  }
}