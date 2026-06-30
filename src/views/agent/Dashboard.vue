<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">工作台</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日接单</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.todayOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ClipboardListIcon class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">待处理</p>
            <p class="text-3xl font-bold text-amber-600 mt-1">{{ stats.pendingOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <ClockIcon class="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日收入</p>
            <p class="text-3xl font-bold text-green-600 mt-1">¥{{ stats.todayIncome?.toFixed(2) || '0.00' }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">累计收入</p>
            <p class="text-3xl font-bold text-purple-600 mt-1">¥{{ stats.totalIncome?.toFixed(2) || '0.00' }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">接单类型分布</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <PrinterIcon class="w-5 h-5 text-blue-500" />
            </div>
            <p class="text-2xl font-bold text-blue-600">{{ typeStats.print || 0 }}</p>
            <p class="text-sm text-gray-500">打印</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AcademicCapIcon class="w-5 h-5 text-green-500" />
            </div>
            <p class="text-2xl font-bold text-green-600">{{ typeStats.course || 0 }}</p>
            <p class="text-sm text-gray-500">网课</p>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClipboardListIcon class="w-5 h-5 text-amber-500" />
            </div>
            <p class="text-2xl font-bold text-amber-600">{{ typeStats.express || 0 }}</p>
            <p class="text-sm text-gray-500">快递</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <PencilIcon class="w-5 h-5 text-purple-500" />
            </div>
            <p class="text-2xl font-bold text-purple-600">{{ typeStats.handwriting || 0 }}</p>
            <p class="text-sm text-gray-500">代写</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">最新订单</h3>
          <router-link to="/agent/orders" class="text-sm text-emerald-600 hover:text-emerald-800">
            查看全部 →
          </router-link>
        </div>
        <div class="p-4 space-y-3">
          <div v-if="recentOrders.length === 0" class="text-center py-8 text-gray-400">
            暂无订单
          </div>
          <div 
            v-for="order in recentOrders" 
            :key="order.id"
            class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', typeBgClass(order.type)]">
              <PrinterIcon v-if="order.type === 'print'" :class="['w-5 h-5', typeTextClass(order.type)]" />
              <AcademicCapIcon v-else-if="order.type === 'course'" :class="['w-5 h-5', typeTextClass(order.type)]" />
              <ClipboardListIcon v-else :class="['w-5 h-5', typeTextClass(order.type)]" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800 text-sm">{{ order.order_no }}</p>
              <p class="text-xs text-gray-500">{{ typeLabels[order.type] }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-800">¥{{ order.total_amount.toFixed(2) }}</p>
              <span :class="['px-2 py-0.5 rounded text-xs', statusClass(order.status)]">
                {{ statusLabels[order.status] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { 
  ClipboardListIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  PrinterIcon,
  AcademicCapIcon,
  PencilIcon
} from '@heroicons/vue/outline'

const stats = ref<any>({})
const typeStats = ref<any>({})
const recentOrders = ref<any[]>([])

const statusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  assigned: '已分配',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消'
}

const typeLabels: Record<string, string> = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '写字服务'
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    assigned: 'bg-indigo-100 text-indigo-700',
    processing: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function typeBgClass(type: string) {
  const classes: Record<string, string> = {
    print: 'bg-blue-100',
    course: 'bg-green-100',
    express: 'bg-amber-100',
    handwriting: 'bg-purple-100'
  }
  return classes[type] || 'bg-gray-100'
}

function typeTextClass(type: string) {
  const classes: Record<string, string> = {
    print: 'text-blue-600',
    course: 'text-green-600',
    express: 'text-amber-600',
    handwriting: 'text-purple-600'
  }
  return classes[type] || 'text-gray-600'
}

function getAuthHeaders() {
  const token = localStorage.getItem('agent_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchStats() {
  try {
    const res = await axios.get('/api/agent/stats', {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      stats.value = res.data.data || {}
      typeStats.value = res.data.data.typeStats || {}
    }
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
}

async function fetchRecentOrders() {
  try {
    const res = await axios.get('/api/agent/orders', {
      headers: getAuthHeaders(),
      params: { limit: 5 }
    })
    if (res.data.code === 0) {
      recentOrders.value = res.data.data.list || []
    }
  } catch (e) {
    console.error('获取订单列表失败', e)
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentOrders()
})
</script>
