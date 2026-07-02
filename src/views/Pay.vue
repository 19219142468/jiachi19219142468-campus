<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="$router.back()" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-bold text-gray-800">订单支付</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="order" class="card mb-6">
        <h3 class="font-semibold text-gray-800 mb-4">订单摘要</h3>
        <div class="flex items-center gap-3 mb-4">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', typeColors[order.type] || 'bg-blue-100']">
            <PrinterIcon v-if="order.type === 'print'" class="w-6 h-6 text-blue-600" />
            <AcademicCapIcon v-else-if="order.type === 'course'" class="w-6 h-6 text-green-600" />
            <TruckIcon v-else-if="order.type === 'express'" class="w-6 h-6 text-purple-600" />
            <PencilIcon v-else class="w-6 h-6 text-orange-600" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-800">{{ typeNames[order.type] || order.type }}</p>
            <p class="text-sm text-gray-500">订单号: {{ order.order_no }}</p>
          </div>
        </div>
        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
          <span class="text-gray-600">应付金额</span>
          <span class="text-2xl font-bold text-primary-600">¥{{ order.total_amount.toFixed(2) }}</span>
        </div>
      </div>

      <div v-if="order && order.status === 'paid'" class="card bg-green-50 border-green-200 mb-6">
        <div class="flex items-center gap-3 text-green-800">
          <CheckCircleIcon class="w-8 h-8 text-green-600" />
          <div>
            <p class="font-semibold text-lg">付款核验成功</p>
            <p class="text-sm text-green-600">订单已分配接单人员，请等待联系</p>
          </div>
        </div>
        <button 
          @click="goToOrders"
          class="w-full mt-4 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all"
        >
          查看我的订单
        </button>
      </div>

      <div v-if="order && order.status === 'cancelled'" class="card bg-red-50 border-red-200 mb-6">
        <div class="flex items-center gap-3 text-red-800">
          <ClockIcon class="w-8 h-8 text-red-600" />
          <div>
            <p class="font-semibold text-lg">订单已超时取消</p>
            <p class="text-sm text-red-600">未查询到对应付款，您可以重新下单支付</p>
          </div>
        </div>
        <button 
          @click="$router.push('/')"
          class="w-full mt-4 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 transition-all"
        >
          返回首页重新下单
        </button>
      </div>

      <div v-if="order && (order.status === 'pending' || order.status === 'pending_confirm')" class="space-y-6">
        <div v-if="!selectedMethod && order.status === 'pending'" class="card">
          <h3 class="font-semibold text-gray-800 mb-4">选择支付方式</h3>
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="selectMethod('alipay')"
              class="p-4 border-2 rounded-xl text-center transition-all hover:border-blue-400"
            >
              <div class="w-16 h-16 mx-auto mb-2 bg-blue-500 rounded-2xl flex items-center justify-center">
                <span class="text-white text-2xl font-bold">支</span>
              </div>
              <p class="font-medium text-gray-800">支付宝</p>
            </button>
            <button 
              @click="selectMethod('wechat')"
              class="p-4 border-2 rounded-xl text-center transition-all hover:border-green-400"
            >
              <div class="w-16 h-16 mx-auto mb-2 bg-green-500 rounded-2xl flex items-center justify-center">
                <span class="text-white text-2xl font-bold">微</span>
              </div>
              <p class="font-medium text-gray-800">微信支付</p>
            </button>
          </div>
        </div>

        <div v-if="selectedMethod && order.status === 'pending'" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">请扫码支付</h3>
            <button @click="selectedMethod = ''" class="text-sm text-gray-500 hover:text-gray-700">
              切换支付方式
            </button>
          </div>
          
          <div class="text-center">
            <div class="bg-gray-50 rounded-2xl p-6 mb-4">
              <p class="text-3xl font-bold text-gray-800 mb-2">¥{{ order?.total_amount.toFixed(2) }}</p>
              <p class="text-sm text-gray-500">转账时备注：{{ order?.order_no }}</p>
            </div>

            <div class="bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 mb-4">
              <img 
                v-if="selectedMethod === 'alipay' && qrcode.alipay_qrcode"
                :src="qrcode.alipay_qrcode" 
                alt="支付宝收款码"
                class="w-64 h-64 mx-auto rounded-lg"
              />
              <img 
                v-else-if="selectedMethod === 'wechat' && qrcode.wechat_qrcode"
                :src="qrcode.wechat_qrcode" 
                alt="微信收款码"
                class="w-64 h-64 mx-auto rounded-lg"
              />
              <div v-else class="w-64 h-64 mx-auto rounded-lg bg-gray-100 flex items-center justify-center">
                <p class="text-gray-400">暂未设置收款码</p>
              </div>
            </div>

            <p v-if="selectedMethod === 'alipay'" class="text-sm text-gray-500 mb-4">
              支付宝：{{ qrcode.admin_alipay || '请在后台设置' }}
            </p>
            <p v-else class="text-sm text-gray-500 mb-4">
              微信：{{ qrcode.admin_wechat || '请在后台设置' }}
            </p>

            <div class="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 mb-4 text-left">
              <p class="font-bold text-orange-800 mb-3 text-lg">支付步骤：</p>
              <ol class="text-sm text-orange-700 space-y-2">
                <li class="flex items-start gap-2">
                  <span class="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>打开<strong>{{ selectedMethod === 'alipay' ? '支付宝' : '微信' }}</strong>扫一扫上方收款码</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>转账金额：<strong class="text-xl text-orange-900">¥{{ order?.total_amount.toFixed(2) }}</strong></span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <div>
                    <span>转账备注/说明填写：</span>
                    <span class="font-mono font-bold text-lg text-orange-900 bg-orange-100 px-2 py-1 rounded ml-1">{{ order?.order_no }}</span>
                  </div>
                </li>
                <li class="flex items-start gap-2">
                  <span class="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span>转账完成后，<strong>截图保存转账成功页面</strong>，点击下方按钮上传截图</span>
                </li>
              </ol>
            </div>

            <!-- 转账截图上传 -->
            <div class="bg-white border-2 border-dashed rounded-xl p-4 mb-4" :class="proofImage ? 'border-green-300 bg-green-50/50' : 'border-gray-300'">
              <p class="text-sm font-medium text-gray-700 mb-2">上传转账截图 <span class="text-red-500">*必填</span></p>
              <div v-if="!proofImage" class="text-center py-4">
                <label class="cursor-pointer inline-flex flex-col items-center gap-2">
                  <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <CameraIcon class="w-8 h-8 text-gray-400" />
                  </div>
                  <span class="text-sm text-gray-500">点击上传转账成功截图</span>
                  <span class="text-xs text-gray-400">支持拍照或相册选取</span>
                  <input type="file" accept="image/*" @change="handleProofUpload" class="hidden" />
                </label>
              </div>
              <div v-else class="relative">
                <img :src="proofImage" alt="转账截图" class="w-full max-h-48 object-contain rounded-lg mx-auto" />
                <button @click="proofImage = ''" class="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                  <XIcon class="w-5 h-5" />
                </button>
                <p class="text-center text-sm text-green-600 mt-2 font-medium">截图已上传</p>
              </div>
            </div>

            <button 
              @click="markAsPaid"
              :disabled="submitting || !proofImage"
              class="w-full py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? '提交中...' : '✓ 我已完成转账' }}
            </button>

            <p class="text-xs text-gray-400 mt-4">
              提交后管理员将核验付款，确认收款后订单立即生效
            </p>
          </div>
        </div>

        <div v-if="order.status === 'pending_confirm'" class="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <svg class="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-bold text-xl text-blue-800 mb-1">正在自动核验付款状态</p>
              <p class="text-blue-600">{{ countdown }}秒后自动跳转...</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-blue-200 bg-white/50 rounded-xl p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">订单号</p>
                <p class="font-mono font-bold text-gray-800">{{ order?.order_no }}</p>
              </div>
              <div>
                <p class="text-gray-500">转账金额</p>
                <p class="font-bold text-xl text-green-600">¥{{ order?.total_amount.toFixed(2) }}</p>
              </div>
            </div>
            <div class="mt-4 bg-blue-50 rounded-lg p-3">
              <p class="text-sm text-blue-800">
                🔍 <strong>系统正在核验中...</strong><br/>
                💡 核验通过后订单将自动分配给接单人员<br/>
                📱 您可以在「我的订单」中查看订单状态
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi, publicApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { ChevronLeftIcon, CheckCircleIcon, ClockIcon, PrinterIcon, AcademicCapIcon, TruckIcon, PencilIcon, CameraIcon, XIcon } from '@heroicons/vue/outline'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import { formatMoney, formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const order = ref<any>(null)
const selectedMethod = ref('')
const submitting = ref(false)
const countdown = ref(5)
const proofImage = ref('')
const qrcode = ref<any>({
  alipay_qrcode: '',
  wechat_qrcode: '',
  admin_alipay: '',
  admin_wechat: ''
})

const typeNames: Record<string, string> = {
  print: '文件打印服务',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '文案代写服务'
}

const typeColors: Record<string, string> = {
  print: 'bg-blue-100',
  course: 'bg-green-100',
  express: 'bg-purple-100',
  handwriting: 'bg-orange-100'
}

async function fetchQrcode() {
  try {
    const res = await publicApi.getPaymentQrcode()
    if (res.code === 0) {
      qrcode.value = res.data || {}
    }
  } catch (e) {
    console.error('获取收款码失败', e)
  }
}

async function fetchOrder() {
  try {
    const orderId = Number(route.params.orderId)
    const token = localStorage.getItem('token')
    
    const urlParams = new URLSearchParams(window.location.search)
    const phoneParam = urlParams.get('phone')
    const visitorPhone = localStorage.getItem('visitor_phone')
    
    let res
    if (token) {
      res = await orderApi.getOrderDetail(orderId)
    } else if (phoneParam) {
      res = await orderApi.getOrderDetailByPhone(orderId, phoneParam)
    } else if (visitorPhone) {
      res = await orderApi.getOrderDetailByPhone(orderId, visitorPhone)
    } else {
      res = await orderApi.getOrderDetail(orderId)
    }
    
    if (res.code === 0) {
      order.value = res.data
      if (res.data.status === 'pending_confirm') {
        startCountdown()
      }
    }
  } catch (e) {
    console.error('获取订单失败', e)
  }
}

function getUserPhone() {
  if (userStore.user?.phone && /^1\d{10}$/.test(userStore.user.phone)) {
    return userStore.user.phone
  }
  const visitorPhone = localStorage.getItem('visitor_phone')
  if (visitorPhone && /^1\d{10}$/.test(visitorPhone)) {
    return visitorPhone
  }
  if (order.value) {
    if (order.value.print_phone && /^1\d{10}$/.test(order.value.print_phone)) {
      return order.value.print_phone
    }
    if (order.value.user_phone && /^1\d{10}$/.test(order.value.user_phone)) {
      return order.value.user_phone
    }
  }
  return ''
}

function selectMethod(method: string) {
  selectedMethod.value = method
}

function handleProofUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('图片不能超过5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    proofImage.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function markAsPaid() {
  if (!order.value) return
  if (!proofImage.value) {
    alert('请先上传转账截图')
    return
  }
  
  submitting.value = true
  try {
    const res = await orderApi.confirmTransfer(Number(route.params.orderId), proofImage.value)
    if (res.code === 0) {
      order.value.status = 'pending_confirm'
      startCountdown()
    }
  } catch (e: any) {
    console.error('提交失败', e)
    alert('提交失败，请刷新页面重试')
  } finally {
    submitting.value = false
  }
}

let countdownTimer: number | null = null

function startCountdown() {
  countdown.value = 5
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
      const userPhone = getUserPhone()
      if (userPhone) {
        localStorage.setItem('visitor_phone', userPhone)
        router.push(`/order?phone=${encodeURIComponent(userPhone)}`)
      } else {
        router.push('/order')
      }
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function goToOrders() {
  const userPhone = getUserPhone()
  if (userPhone) {
    localStorage.setItem('visitor_phone', userPhone)
    router.push(`/order?phone=${encodeURIComponent(userPhone)}`)
  } else {
    router.push('/order')
  }
}

onMounted(() => {
  fetchQrcode()
  fetchOrder()
})

onUnmounted(() => {
  stopCountdown()
})
</script>
