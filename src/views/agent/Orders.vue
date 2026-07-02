<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">我的订单</h1>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-600 mb-1">订单状态</label>
          <select v-model="filterStatus" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="assigned">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <button 
          @click="fetchOrders" 
          class="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          筛选
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">下单时间</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-800">{{ order.order_no }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', typeClass(order.type)]">
                  {{ typeLabels[order.type] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">¥{{ formatMoney(order.total_amount) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', statusClass(order.status)]">
                  {{ statusLabels[order.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(order.created_at) }}</td>
              <td class="px-6 py-4 text-sm">
                <button @click="viewDetail(order.id)" class="text-emerald-600 hover:text-emerald-800 mr-3">
                  详情
                </button>
                <button 
                  v-if="order.status === 'assigned'"
                  @click="processOrder(order.id)" 
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  开始处理
                </button>
                <button 
                  v-if="order.status === 'processing'"
                  @click="showCompleteModal(order)" 
                  class="text-green-600 hover:text-green-800"
                >
                  完成订单
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="orders.length === 0" class="text-center py-12 text-gray-400">
          暂无订单
        </div>
      </div>
    </div>

    <div v-if="showDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 class="text-lg font-semibold text-gray-800">订单详情</h3>
          <button @click="showDetail = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6" v-if="orderDetail">
          <div class="space-y-6">
            <div>
              <h4 class="font-medium text-gray-800 mb-3">基本信息</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-gray-500">订单号：</span>{{ orderDetail.order_no }}</div>
                <div><span class="text-gray-500">状态：</span>
                  <span :class="['px-2 py-1 rounded-full text-xs', statusClass(orderDetail.status)]">
                    {{ statusLabels[orderDetail.status] }}
                  </span>
                </div>
                <div><span class="text-gray-500">类型：</span>{{ typeLabels[orderDetail.type] }}</div>
                <div><span class="text-gray-500">金额：</span>¥{{ formatMoney(orderDetail.total_amount) }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-800 mb-3">操作记录</h4>
              <div class="space-y-3">
                <div v-for="log in orderDetail.logs" :key="log.id" class="flex gap-3 text-sm">
                  <div class="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p class="text-gray-800">{{ log.remark }}</p>
                    <p class="text-gray-400 text-xs">{{ formatTime(log.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showComplete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">完成订单</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">完成备注</label>
            <textarea 
              v-model="completeRemark"
              rows="3"
              placeholder="请输入完成说明（选填）"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button 
              @click="showComplete = false" 
              class="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              @click="completeOrder" 
              :disabled="completing"
              class="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ completing ? '提交中...' : '确认完成' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { formatMoney, formatTime } from '@/utils/format'
import { XIcon } from '@heroicons/vue/outline'

const orders = ref<any[]>([])
const filterStatus = ref('')
const showDetail = ref(false)
const orderDetail = ref<any>(null)
const showComplete = ref(false)
const completeRemark = ref('')
const completing = ref(false)
const currentOrderId = ref<number | null>(null)

const statusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  assigned: '待处理',
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

function getAuthHeaders() {
  const token = localStorage.getItem('agent_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchOrders() {
  try {
    const res = await axios.get('/api/agent/orders', {
      headers: getAuthHeaders(),
      params: { status: filterStatus.value, limit: 50 }
    })
    if (res.data.code === 0) {
      orders.value = res.data.data.list || []
    }
  } catch (e) {
    console.error('获取订单列表失败', e)
  }
}

async function viewDetail(id: number) {
  try {
    const res = await axios.get(`/api/agent/orders/${id}`, {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      orderDetail.value = res.data.data
      showDetail.value = true
    }
  } catch (e) {
    console.error('获取订单详情失败', e)
  }
}

async function processOrder(id: number) {
  if (!confirm('确定要开始处理这个订单吗？')) return
  try {
    const res = await axios.put(`/api/agent/orders/${id}/process`, {}, {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      fetchOrders()
      alert('操作成功')
    } else {
      alert(res.data.message || '操作失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  }
}

function showCompleteModal(order: any) {
  currentOrderId.value = order.id
  completeRemark.value = ''
  showComplete.value = true
}

async function completeOrder() {
  if (!currentOrderId.value) return
  completing.value = true
  try {
    const res = await axios.put(
      `/api/agent/orders/${currentOrderId.value}/complete`,
      { remark: completeRemark.value, proof_images: [] },
      { headers: getAuthHeaders() }
    )
    if (res.data.code === 0) {
      showComplete.value = false
      fetchOrders()
      alert('订单已完成')
    } else {
      alert(res.data.message || '操作失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  } finally {
    completing.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
