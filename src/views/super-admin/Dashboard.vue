<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">数据看板</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日下单</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.todayOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ClipboardListIcon class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-3">本周 {{ stats.weekOrders || 0 }} 单</p>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">待处理订单</p>
            <p class="text-3xl font-bold text-amber-600 mt-1">{{ stats.pendingOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <ClockIcon class="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-3">需尽快处理</p>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">今日收入</p>
            <p class="text-3xl font-bold text-green-600 mt-1">¥{{ formatMoney(stats.todayIncome) }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-3">本月 ¥{{ formatMoney(stats.monthIncome) }}</p>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">已完成订单</p>
            <p class="text-3xl font-bold text-purple-600 mt-1">{{ stats.completedOrders || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <CheckCircleIcon class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p class="text-sm text-gray-400 mt-3">累计完成</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">平台总览</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">总订单数</span>
            <span class="font-semibold text-gray-800">{{ stats.totalOrders || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">总收入</span>
            <span class="font-semibold text-green-600">¥{{ formatMoney(stats.totalRevenue) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">注册用户</span>
            <span class="font-semibold text-gray-800">{{ stats.totalUsers || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">业务员数量</span>
            <span class="font-semibold text-indigo-600">{{ stats.totalAgents || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
        <h3 class="font-semibold text-gray-800 mb-4">服务类型分布</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <PrinterIcon class="w-5 h-5 text-blue-500" />
            </div>
            <p class="text-2xl font-bold text-blue-600">{{ typeStats.print || 0 }}</p>
            <p class="text-sm text-gray-500">文件打印</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AcademicCapIcon class="w-5 h-5 text-green-500" />
            </div>
            <p class="text-2xl font-bold text-green-600">{{ typeStats.course || 0 }}</p>
            <p class="text-sm text-gray-500">课业时长整理服务</p>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClipboardListIcon class="w-5 h-5 text-amber-500" />
            </div>
            <p class="text-2xl font-bold text-amber-600">{{ typeStats.express || 0 }}</p>
            <p class="text-sm text-gray-500">校内包裹配送服务</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <PencilIcon class="w-5 h-5 text-purple-500" />
            </div>
            <p class="text-2xl font-bold text-purple-600">{{ typeStats.handwriting || 0 }}</p>
            <p class="text-sm text-gray-500">写字服务</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">业务员接单排行</h3>
        </div>
        <div class="p-4">
          <div v-if="agentRankings.length === 0" class="text-center py-8 text-gray-400">
            暂无数据
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="(agent, index) in agentRankings" 
              :key="agent.id"
              class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-50 text-gray-500'
                ]"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-800">{{ agent.name }}</p>
                <p class="text-xs text-gray-500">{{ agent.username }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-800">{{ agent.total_orders }} 单</p>
                <p class="text-xs text-green-600">¥{{ formatMoney(agent.total_income) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">最新订单</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">订单号</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">金额</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-3 text-sm text-gray-800">{{ order.order_no }}</td>
                <td class="px-6 py-3 text-sm">
                  <span :class="['px-2 py-1 rounded-full text-xs', typeClass(order.type)]">
                    {{ typeLabels[order.type] }}
                  </span>
                </td>
                <td class="px-6 py-3 text-sm font-medium text-gray-800">¥{{ formatMoney(order.total_amount) }}</td>
                <td class="px-6 py-3 text-sm">
                  <span :class="['px-2 py-1 rounded-full text-xs', statusClass(order.status)]">
                    {{ statusLabels[order.status] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="recentOrders.length === 0" class="text-center py-8 text-gray-400">
            暂无订单
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { formatMoney } from '@/utils/format'
import { 
  ClipboardListIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  PrinterIcon,
  AcademicCapIcon,
  PencilIcon
} from '@heroicons/vue/outline'

const stats = ref<any>({})
const typeStats = ref<any>({})
const agentRankings = ref<any[]>([])
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

function typeClass(type: string) {
  const classes: Record<string, string> = {
    print: 'bg-blue-100 text-blue-700',
    course: 'bg-green-100 text-green-700',
    express: 'bg-amber-100 text-amber-700',
    handwriting: 'bg-purple-100 text-purple-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

async function fetchStats() {
  const token = localStorage.getItem('super_admin_token')
  try {
    const res = await axios.get('/api/super-admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.code === 0) {
      stats.value = res.data.data.stats || {}
      typeStats.value = res.data.data.typeStats || {}
      agentRankings.value = res.data.data.agentRankings || []
      recentOrders.value = res.data.data.recentOrders || []
    }
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
