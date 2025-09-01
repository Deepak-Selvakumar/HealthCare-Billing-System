import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill, BillItem } from '../interfaces/bill';
import { ApiService } from './api.service';

export interface BillSearchParams {
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  constructor(private api: ApiService) {}

  // Get all bills with optional filters
  getBills(params?: BillSearchParams): Observable<Bill[]> {
    return this.api.get<Bill[]>('bills', params);
  }

  // Get bills for specific patient
  getBillsByPatient(patientId: string): Observable<Bill[]> {
    return this.api.get<Bill[]>(`bills/patient/${patientId}`);
  }

  // Get single bill by ID
  getBill(id: string): Observable<Bill> {
    return this.api.get<Bill>(`bills/${id}`);
  }

  // Create new bill
  createBill(bill: Partial<Bill>): Observable<Bill> {
    return this.api.post<Bill>('bills', bill);
  }

  // Update existing bill
  updateBill(id: string, bill: Partial<Bill>): Observable<Bill> {
    return this.api.put<Bill>(`bills/${id}`, bill);
  }

  // Update bill status
  updateBillStatus(id: string, status: string): Observable<Bill> {
    return this.api.patch<Bill>(`bills/${id}/status`, { status });
  }

  // Delete bill
  deleteBill(id: string): Observable<void> {
    return this.api.delete<void>(`bills/${id}`);
  }

  // Add item to bill
  addBillItem(billId: string, item: BillItem): Observable<Bill> {
    return this.api.post<Bill>(`bills/${billId}/items`, item);
  }

  // Remove item from bill
  removeBillItem(billId: string, itemIndex: number): Observable<Bill> {
    return this.api.delete<Bill>(`bills/${billId}/items/${itemIndex}`);
  }

  // Generate PDF for bill
  generateBillPdf(billId: string): Observable<Blob> {
    return this.api.download(`bills/${billId}/pdf`);
  }

  // Get billing statistics
  getBillingStats(): Observable<any> {
    return this.api.get<any>('bills/stats');
  }
}