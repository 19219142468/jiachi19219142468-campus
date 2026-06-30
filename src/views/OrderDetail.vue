<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="$router.back()" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-bold text-gray-800">订单详情</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="loading" class="card animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>

      <div v-else-if="order" class="space-y-6">
        <!-- 订单状态 -->
        <div class="card">
          <div class="flex items-center gap-4">
            <div :class="['w-14 h-14 rounded-full flex items-center justify-center', statusBg(order.status)]">
              <CheckCircleIcon v-if="order.status === 'completed'" class="w-7 h-7 text-white" />
              <ClockIcon v-else-if="order.status === 'pending'" class="w-7 h-7 text-white" />
              <RefreshIcon v-else class="w-7 h-7 text-white animate-spin" />
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-800">{{ statusLabels[order.status] }}</p>
              <p class="text-sm text-gray-500">{{ statusDesc(order.status) }}</p>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-4">订单信息</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">订单编号</span>
              <span class="text-gray-800">{{ order.order_no }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">订单类型</span>
              <span class="text-gray-800">{{ typeLabels[order.type] }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">下单时间</span>
              <span class="text-gray-800">{{ formatTime(order.created_at) }}</span>
            </div>
            <div v-if="order.paid_at" class="flex justify-between">
              <span class="text-gray-500">支付时间</span>
              <span class="text-gray-800">{{ formatTime(order.paid_at) }}</span>
            </div>
            <div v-if="order.completed_at" class="flex justify-between">
              <span class="text-gray-500">完成时间</span>
              <span class="text-gray-800">{{ formatTime(order.completed_at) }}</span>
            </div>
          </div>
        </div>

        <!-- 服务详情 -->
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-4">服务详情</h3>
          <div v-if="order.type === 'print'" class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <DocumentIcon class="w-8 h-8 text-primary-600" />
              <div class="flex-1">
                <p class="font-medium text-gray-800">{{ item.file_name || '未命名文件' }}</p>
                <p class="text-sm text-gray-500">
                  {{ item.print_type === 'black' ? '黑白' : '彩色' }}打印 × {{ item.copies }}份
                  | {{ item.sides === 'single' ? '单面' : '双面' }} | {{ item.pages }}页
                </p>
              </div>
            </div>
          </div>
          <div v-else-if="order.type === 'course'" class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="p-3 bg-gray-50 rounded-lg">
              <p class="font-medium text-gray-800">{{ item.course_name }}</p>
              <p class="text-sm text-gray-500 mt-1">平台: {{ item.platform || '未填写' }}</p>
              <p v-if="item.urgent" class="text-sm text-accent-600 mt-1">含加急服务</p>
            </div>
          </div>
          <div v-else-if="order.type === 'express'" class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="p-3 bg-gray-50 rounded-lg space-y-2">
              <p class="font-medium text-gray-800">
                {{ item.express_size === 'large' ? '大件' : '小件' }}校内包裹配送服务
                <span v-if="item.urgent" class="ml-2 text-accent-600 text-sm">加急</span>
              </p>
              <p class="text-sm text-gray-500">取件码：{{ item.express_pickup_code }}</p>
              <p v-if="item.express_name" class="text-sm text-gray-500">收货人：{{ item.express_name }}</p>
              <p v-if="item.express_phone" class="text-sm text-gray-500">手机号：{{ item.express_phone }}</p>
              <p v-if="item.express_delivery_address" class="text-sm text-gray-500">送货地址：{{ item.express_delivery_address }}</p>
              <p v-if="item.express_remark" class="text-sm text-gray-500">备注：{{ item.express_remark }}</p>
            </div>
          </div>
          <div v-else-if="order.type === 'handwriting'" class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="p-3 bg-gray-50 rounded-lg space-y-2">
              <p class="font-medium text-gray-800">
                写字服务
                <span v-if="item.urgent" class="ml-2 text-accent-600 text-sm">加急</span>
              </p>
              <p class="text-sm text-gray-500">字数：{{ item.hw_word_count }}字</p>
              <p class="text-sm text-gray-500">字体：{{ item.hw_font }}</p>
              <p class="text-sm text-gray-500">类型：{{ item.hw_content_type }}</p>
              <p v-if="item.hw_content" class="text-sm text-gray-500">内容：{{ item.hw_content.slice(0, 50) }}...</p>
            </div>
          </div>
        </div>

        <!-- 取货信息 -->
        <div v-if="order.type === 'print' && (order.print_name || order.address)" class="card">
          <h3 class="font-semibold text-gray-800 mb-4">收货信息</h3>
          <div v-if="order.print_name" class="space-y-2">
            <p class="text-sm"><span class="text-gray-500">收货人：</span><span class="text-gray-800">{{ order.print_name }}</span></p>
            <p class="text-sm"><span class="text-gray-500">手机号：</span><span class="text-gray-800">{{ order.print_phone }}</span></p>
            <p class="text-sm"><span class="text-gray-500">收货地址：</span><span class="text-gray-800">{{ order.print_delivery_address }}</span></p>
          </div>
          <div v-else class="flex items-start gap-3">
            <LocationMarkerIcon class="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <p class="font-medium text-gray-800">{{ order.address.name }} {{ order.address.phone }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ order.address.location }} {{ order.address.detail }}</p>
            </div>
          </div>
        </div>

        <!-- 金额信息 -->
        <div class="card">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">应付金额</span>
            <span class="text-2xl font-bold text-primary-600">¥{{ order.total_amount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-4">
          <button 
            v-if="order.status === 'pending'"
            @click="cancelOrder"
            :disabled="cancelling"
            class="btn-secondary flex-1"
          >
            {{ cancelling ? '取消中...' : '取消订单' }}
          </button>
          <router-link 
            v-if="order.status === 'pending'"
            :to="`/pay/${order.id}`"
            class="btn-primary flex-1 text-center"
          >
            去支付
          </router-link>
          <router-link 
            v-if="order.status === 'pending_confirm'"
            :to="`/pay/${order.id}`"
            class="btn-primary flex-1 text-center"
          >
            查看支付状态
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '@/api'
import { ChevronLeftIcon, CheckCircleIcon, ClockIcon, DocumentIcon, LocationMarkerIcon, RefreshIcon } from '@heroicons/vue/outline'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const order = ref<any>(null)
const cancelling = ref(false)

const statusLabels: Record<string, string> = {
  pending: '待支付',
  pending_confirm: '已支付',
  paid: '已支付',
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

function statusBg(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-500',
    pending_confirm: 'bg-blue-500',
    paid: 'bg-blue-500',
    processing: 'bg-purple-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500'
  }
  return classes[status] || 'bg-gray-500'
}

function statusDesc(status: string) {
  const descs: Record<string, string> = {
    pending: '请尽快完成支付，订单保留30分钟',
    pending_confirm: '付款核验中，请稍候',
    paid: '商家已接单，正在处理中',
    processing: '服务进行中，请耐心等待',
    completed: '服务已完成，欢迎再次使用',
    cancelled: '订单已取消'
  }
  return descs[status] || ''
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

async function fetchOrder() {
  loading.value = true
  try {
    const orderId = Number(route.params.id)
    const token = localStorage.getItem('token')
    
    // 检查URL中是否有phone参数
    const urlParams = new URLSearchParams(window.location.search)
    const phoneParam = urlParams.get('phone')
    
    // 检查本地存储的手机号
    const visitorPhone = localStorage.getItem('visitor_phone')
    
    let res
    if (token) {
      res = await orderApi.getOrderDetail(orderId)
    } else if (phoneParam) {
      res = await orderApi.getOrderDetailByPhone(orderId, phoneParam)
    } else if (visitorPhone) {
      res = await orderApi.getOrderDetailByPhone(orderId, visitorPhone)
    } else {
      // 没有手机号，跳转到订单查询页
      router.push('/order')
      return
    }
    
    if (res.code === 0) {
      order.value = res.data
    }
  } catch (e) {
    console.error('获取订单失败', e)
  } finally {
    loading.value = false
  }
}

async function cancelOrder() {
  if (!confirm('确定要取消该订单吗？')) return
  cancelling.value = true
  try {
    const res = await orderApi.cancelOrder(Number(route.params.id))
    if (res.code === 0) {
      order.value!.status = 'cancelled'
    }
  } catch (e) {
    console.error('取消订单失败', e)
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  fetchOrder()
})
</script>
