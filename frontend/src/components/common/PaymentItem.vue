<script setup lang="ts">
import { computed } from 'vue';
import type { Payment } from '../../types/payment';
import { feeStatusText } from '../../utils/roleText';
import PermissionButton from './PermissionButton.vue';

const props = defineProps<{ payment: Payment }>();
defineEmits<{ pay: [id: number] }>();

const feeTypeText: Record<string, string> = {
  property: '物业费',
  parking: '停车费',
  utilities: '水电费',
};

const isOverdue = computed(() => props.payment.overdue || props.payment.status === 'overdue');

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
</script>

<template>
  <article class="payment-item" :class="{ overdue: isOverdue }">
    <div>
      <div class="payment-item__title-row">
        <strong>{{ feeTypeText[payment.feeType] }}</strong>
        <el-tag v-if="isOverdue" type="danger" size="small" effect="light">已逾期</el-tag>
      </div>
      <span>{{ payment.month }} · {{ feeStatusText(isOverdue ? 'overdue' : payment.status) }}</span>
      <span v-if="payment.dueDate && payment.status !== 'paid'" class="due-date">
        缴费截止：{{ formatDate(payment.dueDate) }}
      </span>
    </div>
    <div class="payment-item__right">
      <strong :class="{ 'amount-overdue': isOverdue }">¥{{ Number(payment.amount).toFixed(2) }}</strong>
      <PermissionButton v-if="payment.status !== 'paid'" permission="payment:pay" size="small" @click="$emit('pay', payment.id)">
        支付宝沙箱支付
      </PermissionButton>
    </div>
  </article>
</template>

<style scoped>
.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid #dfe7d8;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s;
}

.payment-item.overdue {
  border-color: #f56c6c;
  background: #fff7f6;
}

.payment-item__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-item span {
  display: block;
  color: #778273;
  margin-top: 5px;
  font-size: 13px;
}

.payment-item .due-date {
  color: #909399;
  font-size: 12px;
}

.payment-item.overdue .due-date {
  color: #f56c6c;
}

.payment-item__right {
  display: grid;
  justify-items: end;
  gap: 8px;
}

.amount-overdue {
  color: #f56c6c;
}
</style>
