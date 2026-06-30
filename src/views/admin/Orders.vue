<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">订单管理</h1>
    
    <!-- 筛选 -->
    <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div class="flex flex-wrap gap-4">
        <select v-model="filterStatus" class="input-field w-auto">
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
          <option value="processing">处理中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <select v-model="filterType" class="input-field w-auto">
          <option value="">全部类型</option>
          <option value="print">打印</option>
          <option value="course">网课</option>
        </select>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-800">{{ order.order_no }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ order.user?.phone || '未知' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', typeClass(order.type)]">
                  {{ typeLabel(order.type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">¥{{ order.total_amount.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', statusClass(order.status)]">
                  {{ statusLabels[order.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(order.created_at) }}</td>
              <td class="px-6 py-4 text-sm">
                <select 
                  v-if="order.status !== 'completed' && order.status !== 'cancelled'"
                  :value="order.status"
                  @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)"
                  class="text-sm border border-gray-200 rounded px-2 py-1"
                >
                  <option value="paid">已支付</option>
                  <option value="processing">处理中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">取消</option>
                </select>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500">共 {{ total }} 条</p>
        <div class="flex gap-2">
          <button @click="page--" :disabled="page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">上一页</button>
          <span class="px-3 py-1">{{ page }} / {{ totalPages }}</span>
          <button @click="page++" :disabled="page >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { adminApi } from '@/api'

const orders = ref<any[]>([])
const filterStatus = ref('')
const filterType = ref('')
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit.value))

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

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    print: '打印',
    course: '网课',
    express: '快递',
    handwriting: '写字'
  }
  return labels[type] || type
}

function typeClass(type: string) {
  const classes: Record<string, string> = {
    print: 'bg-blue-100 text-blue-700',
    course: 'bg-green-100 text-green-700',
    express: 'bg-orange-100 text-orange-700',
    handwriting: 'bg-purple-100 text-purple-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

async function fetchOrders() {
  try {
    const params: any = { page: page.value, limit: limit.value }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterType.value) params.type = filterType.value
    
    const res = await adminApi.getAllOrders(params)
    if (res.code === 0) {
      orders.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (e) {
    console.error('获取订单失败', e)
  }
}

async function updateStatus(id: number, status: string) {
  try {
    await adminApi.updateOrderStatus(id, status)
    await fetchOrders()
  } catch (e) {
    console.error('更新状态失败', e)
  }
}

watch([filterStatus, filterType], () => {
  page.value = 1
  fetchOrders()
})

watch(page, () => {
  fetchOrders()
})

onMounted(() => {
  fetchOrders()
})
</script>
