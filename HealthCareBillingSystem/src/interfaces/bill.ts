export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentMethod?: 'CASH' | 'CARD' | 'INSURANCE' | 'ONLINE';
  paymentDate?: string;
  items: BillItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface BillStats {
  totalRevenue: number;
  pendingBills: number;
  paidBills: number;
  averageBillAmount: number;
  monthlyRevenue: { month: string; revenue: number }[];
}