<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">订单池</h1>
      <p class="text-sm text-gray-500">已支付待接单的订单</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-600 mb-1">服务类型</label>
          <select v-model="filterType" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="print">文件打印</option>
            <option value="course">课业时长整理服务</option>
            <option value="express">校内包裹配送服务</option>
            <option value="handwriting">写字服务</option>
          </select>
        </div>
        <button 
          @click="fetchPoolOrders" 
          class="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          刷新
        </button>
      </div>
    </div>

    <div v-if="poolOrders.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <CollectionIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">暂无可接订单</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="order in poolOrders" 
        :key="order.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', typeClass(order.type)]">
            {{ typeLabels[order.type] }}
          </span>
          <span class="text-lg font-bold text-emerald-600">¥{{ order.total_amount.toFixed(2) }}</span>
        </div>

        <p class="text-sm text-gray-500 mb-1">订单号</p>
        <p class="font-medium text-gray-800 mb-3">{{ order.order_no }}</p>

        <p class="text-sm text-gray-500 mb-1">发布时间</p>
        <p class="text-sm text-gray-600 mb-4">{{ formatTime(order.created_at) }}</p>

        <button 
          @click="acceptOrder(order.id)"
          :disabled="acceptingId === order.id"
          class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ acceptingId === order.id ? '接单中...' : '立即接单' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { CollectionIcon } from '@heroicons/vue/outline'

const poolOrders = ref<any[]>([])
const filterType = ref('')
const acceptingId = ref<number | null>(null)

const typeLabels: Record<string, string> = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '写字服务'
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

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

function getAuthHeaders() {
  const token = localStorage.getItem('agent_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchPoolOrders() {
  try {
    const res = await axios.get('/api/agent/orders/pool', {
      headers: getAuthHeaders(),
      params: { type: filterType.value, limit: 50 }
    })
    if (res.data.code === 0) {
      poolOrders.value = res.data.data.list || []
    }
  } catch (e) {
    console.error('获取订单池失败', e)
  }
}

async function acceptOrder(id: number) {
  if (!confirm('确定要接这个订单吗？')) return
  acceptingId.value = id
  try {
    const res = await axios.put(`/api/agent/orders/${id}/accept`, {}, {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      alert('接单成功！')
      fetchPoolOrders()
    } else {
      alert(res.data.message || '接单失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '接单失败')
  } finally {
    acceptingId.value = null
  }
}

onMounted(() => {
  fetchPoolOrders()
  startAutoRefresh()
})

let refreshInterval: number | null = null

function startAutoRefresh() {
  if (refreshInterval) return
  refreshInterval = window.setInterval(() => {
    fetchPoolOrders()
  }, 15000)
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
