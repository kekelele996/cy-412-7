import type { User } from './user';

export type PaymentStatus = 'unpaid' | 'paid' | 'overdue';
export type FeeType = 'property' | 'parking' | 'utilities';

export interface Payment {
  id: number;
  userId: number;
  feeType: FeeType;
  amount: number;
  month: string;
  status: PaymentStatus;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  overdue?: boolean;
  user?: User;
}

export interface PaymentOverdueStats {
  overdueAmount: number;
  overdueCount: number;
}

export interface PaymentRemindResult {
  successCount: number;
  failCount: number;
  totalCount: number;
}
