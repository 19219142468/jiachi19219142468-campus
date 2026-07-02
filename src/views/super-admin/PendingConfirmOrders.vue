<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">待确认收款</h1>
      <p class="text-gray-500 text-sm mt-1">用户已提交转账，等待您确认收款</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
        <div class="text-3xl font-bold">{{ pendingCount }}</div>
        <div class="text-orange-100 text-sm">待确认订单</div>
      </div>
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div class="text-3xl font-bold">¥{{ formatMoney(totalAmount) }}</div>
        <div class="text-blue-100 text-sm">待确认金额</div>
      </div>
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
        <div class="text-3xl font-bold">{{ todayCount }}</div>
        <div class="text-green-100 text-sm">今日新增</div>
      </div>
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
        <div class="text-3xl font-bold">¥{{ formatMoney(todayAmount) }}</div>
        <div class="text-purple-100 text-sm">今日金额</div>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div class="flex items-start gap-3">
        <InformationCircleIcon class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-medium text-blue-800 mb-2">💡 如何确认收款？</p>
          <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>打开您的<strong>支付宝/微信</strong>查看收款通知</li>
            <li>核对<strong>转账金额</strong>和<strong>订单号备注</strong></li>
            <li>金额和订单号一致后，点击订单右侧的<strong>"确认收款"</strong>按钮</li>
            <li>确认后订单将自动进入<strong>订单池</strong>等待业务员接单</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div v-if="loading" class="text-center py-12">
      <RefreshIcon class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
      <p class="text-gray-500 mt-2">加载中...</p>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <CheckCircleIcon class="w-16 h-16 text-green-400 mx-auto" />
      <p class="text-gray-600 mt-4 font-medium">太棒了！暂无待确认的订单</p>
      <p class="text-gray-400 text-sm mt-1">用户转账后会显示在这里</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" 
           class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span :class="['px-2 py-1 rounded-lg text-xs font-medium', typeColors[order.type]]">
                {{ typeNames[order.type] }}
              </span>
              <span class="text-xs text-gray-400">订单号: {{ order.order_no }}</span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-500">用户手机</p>
                <p class="font-medium text-gray-800">{{ order.user_phone || '未知' }}</p>
              </div>
              <div>
                <p class="text-gray-500">订单金额</p>
                <p class="font-bold text-xl text-primary-600">¥{{ formatMoney(order.total_amount) }}</p>
              </div>
              <div>
                <p class="text-gray-500">提交时间</p>
                <p class="text-gray-700">{{ formatTime(order.transfer_submitted_at || order.created_at) }}</p>
              </div>
              <div>
                <p class="text-gray-500">等待时长</p>
                <p :class="getWaitTimeClass(order.transfer_submitted_at || order.created_at)">
                  {{ getWaitTime(order.transfer_submitted_at || order.created_at) }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 ml-4">
            <button 
              @click="confirmPayment(order)"
              :disabled="confirming === order.id"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircleIcon class="w-4 h-4" />
              {{ confirming === order.id ? '确认中...' : '确认收款' }}
            </button>
            <button 
              @click="showDetail(order)"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <EyeIcon class="w-4 h-4" />
              查看详情
            </button>
          </div>
        </div>

        <!-- 订单备注提示 -->
        <div v-if="order.pay_method" class="mt-3 pt-3 border-t border-gray-100">
          <p class="text-sm text-gray-500">
            支付方式: 
            <span class="font-medium">{{ order.pay_method === 'alipay' ? '支付宝' : '微信支付' }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="selectedOrder = null">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">订单详情</h3>
          <button @click="selectedOrder = null" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">订单号</span>
            <span class="font-mono font-medium text-gray-800">{{ selectedOrder.order_no }}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">服务类型</span>
            <span class="font-medium text-gray-800">{{ typeNames[selectedOrder.type] }}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-green-50 rounded-xl">
            <span class="text-gray-600">订单金额</span>
            <span class="text-2xl font-bold text-green-600">¥{{ formatMoney(selectedOrder.total_amount) }}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">用户手机</span>
            <span class="font-medium text-gray-800">{{ selectedOrder.user_phone }}</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">提交时间</span>
            <span class="font-medium text-gray-800">{{ formatDateTime(selectedOrder.transfer_submitted_at || selectedOrder.created_at) }}</span>
          </div>
          <!-- 转账截图 -->
          <div v-if="selectedOrder.proof_image" class="p-4 bg-orange-50 rounded-xl">
            <p class="text-gray-600 mb-2 font-medium">转账截图：</p>
            <img :src="selectedOrder.proof_image" alt="转账截图" class="w-full max-h-64 object-contain rounded-lg border" />
          </div>
          <div v-else class="p-4 bg-gray-50 rounded-xl text-center">
            <p class="text-gray-400">用户未上传转账截图</p>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <button @click="confirmPayment(selectedOrder)" class="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">
            确认收款
          </button>
          <button @click="selectedOrder = null" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { superAdminApi } from '@/api'
import { formatMoney, formatTime } from '@/utils/format'
import { CheckCircleIcon, InformationCircleIcon, EyeIcon, XIcon, RefreshIcon } from '@heroicons/vue/outline'

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(false)
const confirming = ref<number | null>(null)
const selectedOrder = ref<any>(null)

const typeNames: Record<string, string> = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '文案代写'
}

const typeColors: Record<string, string> = {
  print: 'bg-blue-100 text-blue-700',
  course: 'bg-green-100 text-green-700',
  express: 'bg-purple-100 text-purple-700',
  handwriting: 'bg-orange-100 text-orange-700'
}

const pendingCount = computed(() => orders.value.length)
const totalAmount = computed(() => orders.value.reduce((sum, o) => sum + o.total_amount, 0))

const today = new Date().toDateString()
const todayOrders = computed(() => orders.value.filter(o => 
  new Date(o.transfer_submitted_at || o.created_at).toDateString() === today
))
const todayCount = computed(() => todayOrders.value.length)
const todayAmount = computed(() => todayOrders.value.reduce((sum, o) => sum + o.total_amount, 0))

async function fetchOrders() {
  loading.value = true
  try {
    const res = await superAdminApi.getPendingConfirmOrders()
    if (res.code === 0) {
      orders.value = res.data.list || []
    }
  } catch (e) {
    console.error('获取待确认订单失败', e)
  } finally {
    loading.value = false
  }
}

async function confirmPayment(order: any) {
  confirming.value = order.id
  try {
    const res = await superAdminApi.confirmPayment(order.id)
    if (res.code === 0) {
      alert('收款确认成功！订单已自动进入订单池')
      selectedOrder.value = null
      fetchOrders()
    } else {
      alert(res.message || '确认失败')
    }
  } catch (e) {
    console.error('确认收款失败', e)
    alert('确认失败，请重试')
  } finally {
    confirming.value = null
  }
}

function showDetail(order: any) {
  selectedOrder.value = order
}

function getWaitTime(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  const diff = now - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟`
  if (hours < 24) return `${hours}小时`
  return `${Math.floor(hours / 24)}天`
}

function getWaitTimeClass(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'text-gray-500 font-medium'
  const diff = now - date.getTime()
  const hours = diff / 3600000
  
  if (hours < 1) return 'text-green-600 font-medium'
  if (hours < 3) return 'text-yellow-600 font-medium'
  return 'text-red-600 font-medium'
}

// 每30秒自动刷新
let refreshInterval: number | null = null

onMounted(() => {
  fetchOrders()
  refreshInterval = window.setInterval(fetchOrders, 30000)
})
</script>
