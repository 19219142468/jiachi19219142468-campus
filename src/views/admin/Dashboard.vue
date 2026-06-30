<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">数据概览</h1>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日订单</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.todayOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardListIcon class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-2">较昨日 +{{ stats.orderGrowth || 0 }}%</p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日收入</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">¥{{ stats.todayIncome?.toFixed(2) || '0.00' }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-2">较昨日 +{{ stats.incomeGrowth || 0 }}%</p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">打印订单</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.printOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <PrinterIcon class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-2">本月累计</p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">网课订单</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.courseOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
            <AcademicCapIcon class="w-6 h-6 text-accent-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-2">本月累计</p>
      </div>
    </div>

    <!-- 近期订单 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">近期订单</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-800">{{ order.order_no }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ order.user?.phone || '未知' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', order.type === 'print' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700']">
                  {{ order.type === 'print' ? '打印' : '网课' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">¥{{ order.total_amount.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', statusClass(order.status)]">
                  {{ statusLabels[order.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(order.created_at) }}</td>
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
import { ClipboardListIcon, CurrencyDollarIcon, PrinterIcon, AcademicCapIcon } from '@heroicons/vue/outline'

const stats = ref<any>({
  todayOrders: 0,
  todayIncome: 0,
  printOrders: 0,
  courseOrders: 0
})
const recentOrders = ref<any[]>([])

const statusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消'
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    const res = await adminApi.getStats()
    if (res.code === 0) {
      stats.value = res.data?.stats || {}
      recentOrders.value = res.data?.recentOrders || []
    }
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
})
</script>
