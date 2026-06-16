import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { listPayments, payPayment, getOverdueStats, sendPaymentReminders } from '../api/payment';
import type { Payment, PaymentOverdueStats } from '../types/payment';

export const usePaymentStore = defineStore('payment', () => {
  const payments = ref<Payment[]>([]);
  const overdueStats = ref<PaymentOverdueStats>({ overdueAmount: 0, overdueCount: 0 });
  const loading = ref(false);
  const statsLoading = ref(false);
  const remindLoading = ref(false);

  const unpaidAmount = computed(() =>
    payments.value.filter((item) => item.status !== 'paid').reduce((sum, item) => sum + Number(item.amount), 0),
  );

  const overdueAmount = computed(() =>
    payments.value.filter((item) => item.overdue || item.status === 'overdue').reduce((sum, item) => sum + Number(item.amount), 0),
  );

  const overduePayments = computed(() =>
    payments.value.filter((item) => item.overdue || item.status === 'overdue'),
  );

  async function fetchPayments() {
    loading.value = true;
    try {
      payments.value = await listPayments();
    } finally {
      loading.value = false;
    }
  }

  async function fetchOverdueStats() {
    statsLoading.value = true;
    try {
      overdueStats.value = await getOverdueStats();
    } finally {
      statsLoading.value = false;
    }
  }

  async function pay(id: number) {
    const updated = await payPayment(id);
    payments.value = payments.value.map((item) => (item.id === id ? updated : item));
  }

  async function remind(paymentIds: number[]) {
    remindLoading.value = true;
    try {
      return await sendPaymentReminders(paymentIds);
    } finally {
      remindLoading.value = false;
    }
  }

  return {
    payments,
    overdueStats,
    loading,
    statsLoading,
    remindLoading,
    unpaidAmount,
    overdueAmount,
    overduePayments,
    fetchPayments,
    fetchOverdueStats,
    pay,
    remind,
  };
});
