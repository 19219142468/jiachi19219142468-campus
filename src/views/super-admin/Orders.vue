<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">订单管理</h1>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-600 mb-1">服务类型</label>
          <select v-model="filters.type" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="print">文件打印</option>
            <option value="course">课业时长整理服务</option>
            <option value="express">校内包裹配送服务</option>
            <option value="handwriting">写字服务</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">订单状态</label>
          <select v-model="filters.status" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="pending">待支付</option>
            <option value="pending_confirm">待确认收款</option>
            <option value="paid">已支付</option>
            <option value="assigned">已分配</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <button 
          @click="fetchOrders" 
          class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
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
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">业务员</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">下单时间</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-800">{{ order.order_no }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ order.user?.phone || '-' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', typeClass(order.type)]">
                  {{ typeLabels[order.type] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">¥{{ order.total_amount.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ order.agent?.name || '-' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', statusClass(order.status)]">
                  {{ statusLabels[order.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(order.created_at) }}</td>
              <td class="px-6 py-4 text-sm">
                <button @click="viewDetail(order.id)" class="text-indigo-600 hover:text-indigo-800 mr-3">
                  详情
                </button>
                <button 
                  v-if="order.status === 'paid'"
                  @click="showAssignModal(order)" 
                  class="text-green-600 hover:text-green-800"
                >
                  分配
                </button>
                <button 
                  v-if="order.agent_id && ['assigned', 'processing'].includes(order.status)"
                  @click="reclaimOrder(order.id)" 
                  class="text-amber-600 hover:text-amber-800 ml-3"
                >
                  回收
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="orders.length === 0" class="text-center py-12 text-gray-400">
          暂无订单数据
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-2">
          <button 
            @click="page > 1 && (page--, fetchOrders())" 
            :disabled="page <= 1"
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="px-4 py-2 text-sm text-gray-600">{{ page }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
          <button 
            @click="page * pageSize < total && (page++, fetchOrders())" 
            :disabled="page * pageSize >= total"
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
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
                <div><span class="text-gray-500">金额：</span>¥{{ orderDetail.total_amount.toFixed(2) }}</div>
                <div><span class="text-gray-500">用户：</span>{{ orderDetail.user?.phone || '-' }}</div>
                <div><span class="text-gray-500">业务员：</span>{{ orderDetail.agent?.name || '-' }}</div>
              </div>
            </div>

            <div v-if="orderDetail.type === 'print'">
              <h4 class="font-medium text-gray-800 mb-3">打印信息</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-gray-500">收件人：</span>{{ orderDetail.print_name || '-' }}</div>
                <div><span class="text-gray-500">联系电话：</span>{{ orderDetail.print_phone || '-' }}</div>
                <div class="col-span-2"><span class="text-gray-500">配送地址：</span>{{ orderDetail.print_delivery_address || '-' }}</div>
              </div>
            </div>

            <div v-if="orderDetail.type === 'express'">
              <h4 class="font-medium text-gray-800 mb-3">快递信息</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-gray-500">大小：</span>{{ orderDetail.express_size === 'large' ? '大件' : '小件' }}</div>
                <div><span class="text-gray-500">取件码：</span>{{ orderDetail.express_pickup_code || '-' }}</div>
                <div><span class="text-gray-500">收件人：</span>{{ orderDetail.express_name || '-' }}</div>
                <div><span class="text-gray-500">联系电话：</span>{{ orderDetail.express_phone || '-' }}</div>
                <div class="col-span-2"><span class="text-gray-500">配送地址：</span>{{ orderDetail.express_delivery_address || '-' }}</div>
                <div class="col-span-2"><span class="text-gray-500">备注：</span>{{ orderDetail.express_remark || '-' }}</div>
              </div>
            </div>

            <div v-if="orderDetail.type === 'handwriting'">
              <h4 class="font-medium text-gray-800 mb-3">写字信息</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="text-gray-500">服务类型：</span>{{ orderDetail.hw_service_type || '-' }}</div>
                <div><span class="text-gray-500">字数：</span>{{ orderDetail.hw_word_count || 0 }}</div>
                <div><span class="text-gray-500">字体：</span>{{ orderDetail.hw_font || '-' }}</div>
                <div><span class="text-gray-500">纸张：</span>{{ orderDetail.hw_paper || '-' }}</div>
                <div class="col-span-2"><span class="text-gray-500">内容：</span>{{ orderDetail.hw_content || '-' }}</div>
                <div class="col-span-2"><span class="text-gray-500">备注：</span>{{ orderDetail.hw_remark || '-' }}</div>
              </div>
            </div>

            <div v-if="orderDetail.items && orderDetail.items.length > 0 && orderDetail.type === 'course'">
              <h4 class="font-medium text-gray-800 mb-3">网课信息</h4>
              <div v-for="(item, idx) in orderDetail.items" :key="idx" class="text-sm space-y-2 p-4 bg-gray-50 rounded-xl">
                <div><span class="text-gray-500">平台：</span>{{ item.platform || '-' }}</div>
                <div><span class="text-gray-500">课程名称：</span>{{ item.course_name || '-' }}</div>
                <div><span class="text-gray-500">账号：</span>{{ item.course_account || '-' }}</div>
                <div><span class="text-gray-500">加急：</span>{{ item.urgent ? '是' : '否' }}</div>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-800 mb-3">操作记录</h4>
              <div class="space-y-3">
                <div v-for="log in orderDetail.logs" :key="log.id" class="flex gap-3 text-sm">
                  <div class="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p class="text-gray-800">{{ log.operator_name }} - {{ log.remark }}</p>
                    <p class="text-gray-400 text-xs">{{ formatTime(log.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAssign" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">分配订单</h3>
        </div>
        <div class="p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">选择业务员</label>
          <select v-model="selectedAgentId" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4">
            <option value="">请选择业务员</option>
            <option v-for="agent in agentList" :key="agent.id" :value="agent.id">
              {{ agent.name }} ({{ agent.username }})
            </option>
          </select>
          <div class="flex gap-3">
            <button 
              @click="showAssign = false" 
              class="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              @click="assignOrder" 
              :disabled="!selectedAgentId || assigning"
              class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ assigning ? '分配中...' : '确认分配' }}
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
import { XIcon } from '@heroicons/vue/outline'

const orders = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = ref({ type: '', status: '' })
const showDetail = ref(false)
const orderDetail = ref<any>(null)
const showAssign = ref(false)
const selectedAgentId = ref<number | ''>('')
const currentOrder = ref<any>(null)
const assigning = ref(false)
const agentList = ref<any[]>([])

const statusLabels: Record<string, string> = {
  pending: '待支付',
  pending_confirm: '待确认收款',
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
    pending_confirm: 'bg-orange-100 text-orange-700',
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

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

function getAuthHeaders() {
  const token = localStorage.getItem('super_admin_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchOrders() {
  try {
    const res = await axios.get('/api/admin/orders', {
      headers: getAuthHeaders(),
      params: { ...filters.value, page: page.value, limit: pageSize.value }
    })
    if (res.data.code === 0) {
      orders.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    }
  } catch (e) {
    console.error('获取订单列表失败', e)
  }
}

async function viewDetail(id: number) {
  try {
    const res = await axios.get(`/api/admin/orders/${id}/detail`, {
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

async function fetchAgents() {
  try {
    const res = await axios.get('/api/super-admin/agents', {
      headers: getAuthHeaders(),
      params: { status: 1, limit: 100 }
    })
    if (res.data.code === 0) {
      agentList.value = res.data.data.list || []
    }
  } catch (e) {
    console.error('获取业务员列表失败', e)
  }
}

function showAssignModal(order: any) {
  currentOrder.value = order
  selectedAgentId.value = ''
  showAssign.value = true
}

async function assignOrder() {
  if (!selectedAgentId.value || !currentOrder.value) return
  assigning.value = true
  try {
    const res = await axios.put(
      `/api/admin/orders/${currentOrder.value.id}/assign`,
      { agent_id: selectedAgentId.value },
      { headers: getAuthHeaders() }
    )
    if (res.data.code === 0) {
      showAssign.value = false
      fetchOrders()
      alert('分配成功')
    } else {
      alert(res.data.message || '分配失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '分配失败')
  } finally {
    assigning.value = false
  }
}

async function reclaimOrder(id: number) {
  if (!confirm('确定要回收这个订单吗？')) return
  try {
    const res = await axios.put(
      `/api/admin/orders/${id}/reclaim`,
      {},
      { headers: getAuthHeaders() }
    )
    if (res.data.code === 0) {
      fetchOrders()
      alert('回收成功')
    } else {
      alert(res.data.message || '回收失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '回收失败')
  }
}

onMounted(() => {
  fetchOrders()
  fetchAgents()
})
</script>
