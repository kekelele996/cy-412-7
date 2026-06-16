import { request } from '../utils/request';
import type { Payment, PaymentOverdueStats, PaymentRemindResult } from '../types/payment';

export const listPayments = () => request.get<never, Payment[]>('/payments');
export const payPayment = (id: number) => request.post<never, Payment>(`/payments/${id}/pay`, {});
export const generateBill = (userId: number, month: string, dueDate?: string) =>
  request.post<never, Payment>('/payments/generate', { userId, month, feeType: 'property', dueDate });
export const getOverdueStats = () => request.get<never, PaymentOverdueStats>('/payments/overdue-stats');
export const sendPaymentReminders = (paymentIds: number[]) =>
  request.post<never, PaymentRemindResult>('/payments/remind', { paymentIds });
