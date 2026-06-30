<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">财务报表</h1>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <p class="text-gray-500 text-sm">平台总余额</p>
        <p class="text-3xl font-bold text-primary-600 mt-1">¥{{ stats.totalBalance?.toFixed(2) || '0.00' }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <p class="text-gray-500 text-sm">今日收入</p>
        <p class="text-3xl font-bold text-green-600 mt-1">¥{{ stats.todayIncome?.toFixed(2) || '0.00' }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <p class="text-gray-500 text-sm">本月收入</p>
        <p class="text-3xl font-bold text-green-600 mt-1">¥{{ stats.monthIncome?.toFixed(2) || '0.00' }}</p>
      </div>
    </div>

    <!-- 统计明细 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="font-semibold text-gray-800 mb-4">收入统计</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">打印服务收入</span>
            <span class="font-medium text-gray-800">¥{{ stats.printIncome?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">课业时长整理服务收入</span>
            <span class="font-medium text-gray-800">¥{{ stats.courseIncome?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">充值收入</span>
            <span class="font-medium text-gray-800">¥{{ stats.rechargeIncome?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="font-semibold text-gray-800 mb-4">支出统计</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">用户提现</span>
            <span class="font-medium text-red-600">-¥{{ stats.withdrawOutcome?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">退款支出</span>
            <span class="font-medium text-red-600">-¥{{ stats.refundOutcome?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 近期交易 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">近期交易记录</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">余额变化</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="record in records" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', typeClass(record.type)]">
                  {{ typeLabels[record.type] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium" :class="record.amount > 0 ? 'text-green-600' : 'text-red-600'">
                {{ record.amount > 0 ? '+' : '' }}{{ record.amount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ record.balance_before?.toFixed(2) || '0.00' }} → {{ record.balance_after?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ record.remark || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(record.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'

const stats = ref<any>({})
const records = ref<any[]>([])

const typeLabels: Record<string, string> = {
  recharge: '充值',
  withdraw: '提现',
  consume: '消费',
  refund: '退款'
}

function typeClass(type: string) {
  const classes: Record<string, string> = {
    recharge: 'bg-green-100 text-green-700',
    withdraw: 'bg-blue-100 text-blue-700',
    consume: 'bg-gray-100 text-gray-700',
    refund: 'bg-yellow-100 text-yellow-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    const res = await adminApi.getFinanceStats()
    if (res.code === 0) {
      stats.value = res.data?.stats || {}
      records.value = res.data?.records || []
    }
  } catch (e) {
    console.error('获取财务数据失败', e)
  }
})
</script>
