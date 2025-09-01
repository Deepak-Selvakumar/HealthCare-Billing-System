import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BillService } from '../../services/bill.service';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../interfaces/patient';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-bill-dialog',
  templateUrl: './add-bill-dialog.component.html',
  styleUrls: ['./add-bill-dialog.component.css'],
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinner
  ]
})
export class AddBillDialogComponent implements OnInit {
  billForm: FormGroup;
  patients: Patient[] = [];
  loading = false;
  patientsLoading = false;

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private patientService: PatientService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddBillDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.billForm = this.createForm();
  }

  // Add this getter method to fix the error
  get f() {
    return this.billForm.controls;
  }

  ngOnInit(): void {
    this.loadPatients();
    
    // If editing existing bill, populate form
    if (this.data && this.data.bill) {
      this.billForm.patchValue(this.data.bill);
      if (this.data.bill.items) {
        this.items.clear();
        this.data.bill.items.forEach((item: any) => this.addItem(item));
      }
    }
    
    // If patient ID is provided, set it and disable the field
    if (this.data && this.data.patientId) {
      this.billForm.get('patientId')?.setValue(this.data.patientId);
      this.billForm.get('patientId')?.disable();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patientId: ['', Validators.required],
      date: [new Date(), Validators.required],
      items: this.fb.array([this.createItem()]),
      tax: [0, [Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      paymentMethod: ['CASH'],
      notes: ['']
    });
  }

  private createItem(item?: any): FormGroup {
    return this.fb.group({
      description: [item?.description || '', Validators.required],
      category: [item?.category || 'CONSULTATION'],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]]
    });
  }

  get items(): FormArray {
    return this.billForm.get('items') as FormArray;
  }

  get totalAmount(): number {
    const subtotal = this.items.controls.reduce((total, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      return total + (quantity * unitPrice);
    }, 0);

    const tax = this.billForm.get('tax')?.value || 0;
    const discount = this.billForm.get('discount')?.value || 0;

    return subtotal + tax - discount;
  }

  private loadPatients(): void {
    this.patientsLoading = true;
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.patientsLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading patients: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.patientsLoading = false;
      }
    });
  }

  addItem(item?: any): void {
    this.items.push(this.createItem(item));
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.billForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    
    // Prepare bill data
    const formValue = this.billForm.getRawValue();
    const billData = {
      ...formValue,
      items: formValue.items.map((item: any) => ({
        ...item,
        total: item.quantity * item.unitPrice
      })),
      amount: this.totalAmount,
      totalAmount: this.totalAmount,
      status: 'PENDING'
    };

    const operation = this.data?.bill
      ? this.billService.updateBill(this.data.bill.id, billData)
      : this.billService.createBill(billData);

    operation.subscribe({
      next: (bill) => {
        this.loading = false;
        this.snackBar.open(
          `Bill ${this.data?.bill ? 'updated' : 'created'} successfully!`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.dialogRef.close(bill);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          `Error ${this.data?.bill ? 'updating' : 'creating'} bill: ${error.message}`,
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.billForm.controls).forEach(key => {
      this.billForm.get(key)?.markAsTouched();
    });
    
    this.items.controls.forEach(itemGroup => {
      Object.keys((itemGroup as FormGroup).controls).forEach(key => {
        itemGroup.get(key)?.markAsTouched();
      });
    });
  }
}