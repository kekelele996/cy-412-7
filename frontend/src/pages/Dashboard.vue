<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import StatCard from '../components/common/StatCard.vue';
import RepairStatusBadge from '../components/common/RepairStatusBadge.vue';
import AnnouncementCard from '../components/common/AnnouncementCard.vue';
import EmptyState from '../components/common/EmptyState.vue';
import PermissionButton from '../components/common/PermissionButton.vue';
import { useRepairStore } from '../stores/repairStore';
import { usePaymentStore } from '../stores/paymentStore';
import { listAnnouncements, markAnnouncementRead } from '../api/announcement';
import { useRepairStats } from '../hooks/useRepairStats';
import type { Announcement } from '../types/announcement';

const repairStore = useRepairStore();
const paymentStore = usePaymentStore();
const announcements = ref<Announcement[]>([]);
const chartEl = ref<HTMLDivElement | null>(null);
const repairStats = useRepairStats(ref(repairStore.repairs));
const selectedOverdueIds = ref<number[]>([]);

const allOverdueSelected = computed({
  get: () =>
    paymentStore.overduePayments.length > 0 &&
    selectedOverdueIds.value.length === paymentStore.overduePayments.length,
  set: (val: boolean) => {
    selectedOverdueIds.value = val ? paymentStore.overduePayments.map((p) => p.id) : [];
  },
});

async function refresh() {
  await Promise.all([repairStore.fetchRepairs(), paymentStore.fetchPayments(), paymentStore.fetchOverdueStats()]);
  announcements.value = await listAnnouncements();
}

function renderChart() {
  if (!chartEl.value) return;
  const chart = echarts.init(chartEl.value);
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 32, right: 18, bottom: 28, top: 24 },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '工单',
        type: 'line',
        smooth: true,
        data: [4, 7, 5, 9, 6, repairStore.repairs.length],
        areaStyle: { color: 'rgba(69, 98, 79, 0.12)' },
        itemStyle: { color: '#45624f' },
      },
    ],
  });
}

async function readAnnouncement(id: number) {
  await markAnnouncementRead(id);
  announcements.value = await listAnnouncements();
}

function toggleOverdue(id: number) {
  const idx = selectedOverdueIds.value.indexOf(id);
  if (idx === -1) {
    selectedOverdueIds.value.push(id);
  } else {
    selectedOverdueIds.value.splice(idx, 1);
  }
}

async function handleBatchRemind() {
  if (selectedOverdueIds.value.length === 0) {
    ElMessage.warning('请先选择要催缴的逾期账单');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定向已选择的 ${selectedOverdueIds.value.length} 笔逾期账单发送催缴提醒？`,
      '批量催缴提醒',
      { type: 'warning', confirmButtonText: '确认发送', cancelButtonText: '取消' },
    );
  } catch {
    return;
  }
  const result = await paymentStore.remind(selectedOverdueIds.value);
  if (result && result.successCount > 0) {
    ElMessage.success(`催缴提醒发送成功，共 ${result.successCount} 笔`);
    selectedOverdueIds.value = [];
  } else {
    ElMessage.error('催缴提醒发送失败');
  }
}

const feeTypeText: Record<string, string> = {
  property: '物业费',
  parking: '停车费',
  utilities: '水电费',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

onMounted(async () => {
  await refresh();
  renderChart();
});

watch(() => repairStore.repairs.length, renderChart);
</script>

<template>
  <section>
    <div class="stats-row">
      <StatCard label="待分配工单" :value="repairStats.pending" hint="需物业派单" tone="amber" />
      <StatCard label="处理中工单" :value="repairStats.processing" hint="含已分配" tone="blue" />
      <StatCard label="本月待收" :value="`¥${paymentStore.unpaidAmount.toFixed(2)}`" hint="支付宝沙箱模拟" tone="green" />
      <StatCard
        label="逾期金额"
        :value="`¥${Number(paymentStore.overdueStats.overdueAmount).toFixed(2)}`"
        :hint="`共 ${paymentStore.overdueStats.overdueCount} 笔逾期`"
        tone="red"
      />
    </div>

    <div class="page-grid two-col">
      <section class="section-panel">
        <div class="section-title">
          <h2>工单趋势</h2>
          <el-button size="small" @click="refresh">刷新</el-button>
        </div>
        <div ref="chartEl" class="chart"></div>
        <div class="mini-repairs">
          <div v-for="repair in repairStore.repairs.slice(0, 3)" :key="repair.id">
            <span>{{ repair.title }}</span>
            <RepairStatusBadge :status="repair.status" />
          </div>
        </div>
      </section>

      <section class="section-panel">
        <div class="section-title">
          <h2>最新公告</h2>
        </div>
        <div v-if="announcements.length" class="list-stack">
          <AnnouncementCard
            v-for="announcement in announcements.slice(0, 3)"
            :key="announcement.id"
            :announcement="announcement"
            @read="readAnnouncement"
          />
        </div>
        <EmptyState v-else title="暂无公告" />
      </section>
    </div>

    <section class="section-panel overdue-panel">
      <div class="section-title">
        <h2>
          逾期账单
          <el-tag type="danger" effect="light" style="margin-left: 8px">{{ paymentStore.overdueStats.overdueCount }} 笔</el-tag>
        </h2>
        <div class="overdue-actions">
          <PermissionButton permission="payment:remind" type="danger" size="small" :disabled="selectedOverdueIds.length === 0" @click="handleBatchRemind">
            批量催缴 ({{ selectedOverdueIds.length }})
          </PermissionButton>
        </div>
      </div>

      <div v-if="paymentStore.overduePayments.length" class="overdue-list">
        <div class="overdue-list__header">
          <el-checkbox v-model="allOverdueSelected" />
          <span class="col-type">费用类型</span>
          <span class="col-month">账期</span>
          <span class="col-due">截止日期</span>
          <span class="col-amount">金额</span>
        </div>
        <div v-for="payment in paymentStore.overduePayments" :key="payment.id" class="overdue-list__row">
          <el-checkbox :model-value="selectedOverdueIds.includes(payment.id)" @change="toggleOverdue(payment.id)" />
          <span class="col-type">{{ feeTypeText[payment.feeType] }}</span>
          <span class="col-month">{{ payment.month }}</span>
          <span class="col-due overdue-text">{{ formatDate(payment.dueDate) }}</span>
          <span class="col-amount overdue-text">¥{{ Number(payment.amount).toFixed(2) }}</span>
        </div>
      </div>
      <EmptyState v-else title="暂无逾期账单" description="所有账单均已按时缴纳" />
    </section>
  </section>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 280px;
}

.mini-repairs {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.mini-repairs div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #e5ecdf;
}

.overdue-panel {
  margin-top: 18px;
}

.overdue-actions {
  display: flex;
  gap: 8px;
}

.overdue-list {
  display: grid;
  gap: 0;
}

.overdue-list__header,
.overdue-list__row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
}

.overdue-list__header {
  font-size: 13px;
  color: #667263;
  border-bottom: 1px solid #e5ecdf;
  font-weight: 600;
}

.overdue-list__row {
  border-bottom: 1px solid #f0f3ec;
  transition: background 0.15s;
}

.overdue-list__row:hover {
  background: #fff7f6;
}

.overdue-text {
  color: #f56c6c;
  font-weight: 500;
}
</style>
