<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">我的订单</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 手机号查询区域（未登录时显示） -->
      <div v-if="!userStore.isLoggedIn && !hasQueried" class="flex flex-col items-center justify-center py-16">
        <div class="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
          <ClipboardListIcon class="w-10 h-10 text-orange-500" />
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">查询我的订单</h2>
        <p class="text-gray-500 mb-8 text-center">输入您的手机号码，即可查看所有订单记录</p>
        
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
              <div class="relative">
                <PhoneIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="searchPhone"
                  type="tel"
                  placeholder="请输入11位手机号码"
                  maxlength="11"
                  @keyup.enter="handleSearch"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                />
              </div>
              <p v-if="phoneError" class="text-red-500 text-sm mt-2">{{ phoneError }}</p>
            </div>
            <button
              @click="handleSearch"
              :disabled="searching || !/^1\d{10}$/.test(searchPhone)"
              class="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshIcon v-if="searching" class="w-5 h-5 animate-spin" />
              <span>{{ searching ? '查询中...' : '查询订单' }}</span>
            </button>
          </div>
          
          <div class="mt-6 text-center">
            <router-link to="/" class="text-gray-500 hover:text-orange-500 text-sm flex items-center justify-center gap-1">
              <ChevronLeftIcon class="w-4 h-4" />
              返回首页
            </router-link>
          </div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div v-else>
        <!-- 用户信息头部 -->
        <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <PhoneIcon v-if="!userStore.isLoggedIn" class="w-5 h-5 text-orange-600" />
                <UserIcon v-else class="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ userStore.isLoggedIn ? '当前登录账号' : '当前查询手机号' }}</p>
                <p class="font-semibold text-gray-800">{{ displayPhone }}</p>
              </div>
            </div>
            <button
              v-if="!userStore.isLoggedIn"
              @click="resetSearch"
              class="px-4 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
            >
              更换手机号
            </button>
            <button
              v-else
              @click="handleLogout"
              class="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <ArrowRightIcon class="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="keyword"
              type="text"
              placeholder="输入订单号快速搜索..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
            />
          </div>
        </div>

        <!-- 服务类型筛选 -->
        <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <h3 class="font-semibold text-gray-800 mb-3">服务类型</h3>
          <div class="flex gap-2 flex-wrap">
            <button
              @click="activeType = 'all'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition-all', activeType === 'all' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              全部
            </button>
            <button
              @click="activeType = 'express'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition-all', activeType === 'express' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              校内包裹配送服务
            </button>
            <button
              @click="activeType = 'handwriting'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition-all', activeType === 'handwriting' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              写字服务
            </button>
            <button
              @click="activeType = 'print'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition-all', activeType === 'print' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              文件打印
            </button>
            <button
              @click="activeType = 'course'"
              :class="['px-4 py-2 rounded-full text-sm font-medium transition-all', activeType === 'course' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >
              课业时长整理服务
            </button>
          </div>
        </div>

        <!-- 订单状态标签 -->
        <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div class="flex overflow-x-auto gap-2">
            <button 
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="['px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all', activeTab === tab.value ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100']"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 订单列表 -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon class="w-10 h-10 text-gray-300" />
          </div>
          <p class="text-gray-500 mb-2">暂无订单记录</p>
          <p class="text-sm text-gray-400">快去下单体验吧~</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <router-link :to="orderDetailUrl(order.id)" class="block">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', typeIconBg(order.type)]">
                    <component :is="typeIcon(order.type)" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ typeLabel(order.type) }}</p>
                    <p class="text-xs text-gray-400">{{ order.order_no }}</p>
                  </div>
                </div>
                <span :class="['px-3 py-1 rounded-full text-xs font-medium', statusBg(order.status)]">
                  {{ statusLabels[order.status] }}
                </span>
              </div>
              
              <div class="text-sm text-gray-500 mb-3 line-clamp-2">
                {{ orderDesc(order) }}
              </div>
              
              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <p class="text-sm text-gray-400">{{ formatTimeAgo(order.created_at) }}</p>
                <p class="text-lg font-bold text-orange-500">¥{{ order.total_amount }}</p>
              </div>
            </router-link>
            <!-- 评价按钮 -->
            <div v-if="order.status === 'completed' && !order.reviewed" class="mt-3 pt-3 border-t border-gray-100">
              <button @click="openReview(order)" class="w-full py-2 bg-orange-50 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors">
                评价此订单
              </button>
            </div>
            <div v-if="order.reviewed" class="mt-3 pt-3 border-t border-gray-100 text-center">
              <span class="text-sm text-green-600">已评价</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 shadow-2xl">
      <div class="flex justify-around py-2">
        <router-link to="/" class="flex flex-col items-center gap-1 text-gray-500">
          <HomeIcon class="w-6 h-6" />
          <span class="text-xs font-medium">首页</span>
        </router-link>
        <router-link to="/order" class="flex flex-col items-center gap-1 text-orange-600">
          <ClipboardListIcon class="w-6 h-6" />
          <span class="text-xs font-medium">订单</span>
        </router-link>
        <router-link to="/profile" class="flex flex-col items-center gap-1 text-gray-500">
          <UserIcon class="w-6 h-6" />
          <span class="text-xs font-medium">我的</span>
        </router-link>
      </div>
    </nav>

    <!-- 评价弹窗 -->
    <div v-if="showReview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showReview = false">
      <div class="bg-white rounded-2xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">评价订单</h3>
        <p class="text-sm text-gray-500 mb-4">订单号：{{ reviewOrder?.order_no }}</p>
        
        <div class="mb-4">
          <p class="text-sm font-medium text-gray-700 mb-2">评分</p>
          <div class="flex gap-2">
            <button v-for="n in 5" :key="n" @click="reviewRating = n" class="text-3xl transition-all" :class="n <= reviewRating ? 'text-yellow-400' : 'text-gray-300'">★</button>
          </div>
        </div>

        <div class="mb-4">
          <p class="text-sm font-medium text-gray-700 mb-2">评价内容（选填）</p>
          <textarea v-model="reviewContent" rows="3" placeholder="说说你的服务体验..." class="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"></textarea>
        </div>

        <div class="flex gap-3">
          <button @click="showReview = false" class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl">取消</button>
          <button @click="submitReview" :disabled="submittingReview" class="flex-1 py-2 bg-orange-500 text-white rounded-xl disabled:opacity-50">
            {{ submittingReview ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { 
  ChevronLeftIcon, 
  ClipboardListIcon, 
  DocumentTextIcon, 
  PhoneIcon, 
  RefreshIcon,
  HomeIcon,
  UserIcon,
  TruckIcon,
  PencilIcon,
  PrinterIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  SearchIcon
} from '@heroicons/vue/outline'
import { formatTimeAgo } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const searching = ref(false)
const orders = ref<any[]>([])
const activeTab = ref('all')
const activeType = ref('all')
const searchPhone = ref('')
const phoneError = ref('')
const hasQueried = ref(false)
const keyword = ref('')
const showReview = ref(false)
const reviewOrder = ref<any>(null)
const reviewRating = ref(5)
const reviewContent = ref('')
const submittingReview = ref(false)

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' }
]

const statusLabels: Record<string, string> = {
  pending: '待支付',
  pending_confirm: '已支付',
  paid: '已支付',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消'
}

function statusBg(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    pending_confirm: 'bg-green-100 text-green-700',
    paid: 'bg-green-100 text-green-700',
    processing: 'bg-orange-100 text-orange-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-500'
  }
  return classes[status] || 'bg-gray-100 text-gray-500'
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    express: '校内包裹配送服务',
    handwriting: '写字服务',
    print: '文件打印',
    course: '课业时长整理服务'
  }
  return labels[type] || '其他'
}

function typeIcon(type: string) {
  const icons: Record<string, any> = {
    express: TruckIcon,
    handwriting: PencilIcon,
    print: PrinterIcon,
    course: AcademicCapIcon
  }
  return icons[type] || DocumentTextIcon
}

function typeIconBg(type: string) {
  const classes: Record<string, string> = {
    express: 'bg-gradient-to-br from-orange-400 to-orange-600',
    handwriting: 'bg-gradient-to-br from-purple-400 to-purple-600',
    print: 'bg-gradient-to-br from-blue-400 to-blue-600',
    course: 'bg-gradient-to-br from-green-400 to-green-600'
  }
  return classes[type] || 'bg-gray-400'
}

function orderDesc(order: any) {
  if (order.type === 'express') {
    return `取件码：${order.pickup_code || order.express_pickup_code || '—'} · ${order.express_size === 'large' ? '大件' : '小件'}${order.urgent ? ' · 加急' : ''}`
  }
  if (order.type === 'handwriting') {
    return `${order.word_count || 0}字 · ${order.font || '标准手写'}${order.urgent ? ' · 加急' : ''}`
  }
  if (order.type === 'print') {
    const totalPages = order.total_pages || order.pages || 0
    const totalCopies = order.total_copies || order.copies || 1
    return `打印服务 · 共${totalPages || '多'}页${totalCopies > 1 ? ` · ${totalCopies}份` : ''}`
  }
  if (order.type === 'course') {
    return `${order.course_platform || '网课平台'} · ${order.course_count || 1}门${order.urgent ? ' · 加急' : ''}`
  }
  return '—'
}

function formatPhone(phone: string) {
  if (phone.length === 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }
  return phone
}

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    result = result.filter(o => 
      o.order_no?.toLowerCase().includes(kw) || 
      String(o.id).includes(kw)
    )
  }
  
  if (activeType.value !== 'all') {
    result = result.filter(o => o.type === activeType.value)
  }
  
  if (activeTab.value !== 'all') {
    if (activeTab.value === 'paid') {
      result = result.filter(o => o.status === 'paid' || o.status === 'pending_confirm')
    } else {
      result = result.filter(o => o.status === activeTab.value)
    }
  }
  
  return result
})

const displayPhone = computed(() => {
  if (userStore.isLoggedIn && userStore.user?.phone) {
    return formatPhone(userStore.user.phone)
  }
  return formatPhone(searchPhone.value)
})

function orderDetailUrl(orderId: number) {
  if (userStore.isLoggedIn) {
    return `/order/${orderId}`
  }
  return `/order/${orderId}?phone=${encodeURIComponent(searchPhone.value)}`
}

async function fetchLoggedInOrders() {
  loading.value = true
  try {
    const res = await orderApi.getOrders({
      page: 1,
      limit: 50
    })
    if (res.code === 0) {
      orders.value = res.data?.list || []
      hasQueried.value = true
    }
  } catch (e) {
    console.error('获取订单失败', e)
    orders.value = []
    hasQueried.value = true
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  phoneError.value = ''
  
  if (!searchPhone.value) {
    phoneError.value = '请输入手机号码'
    return
  }
  
  if (!/^1\d{10}$/.test(searchPhone.value)) {
    phoneError.value = '请输入正确的11位手机号码'
    return
  }
  
  searching.value = true
  loading.value = true
  
  try {
    const res = await orderApi.getOrdersByPhone({
      phone: searchPhone.value,
      page: 1,
      limit: 50
    })
    
    if (res.code === 0) {
      orders.value = res.data?.list || []
      hasQueried.value = true
      // 保存手机号到本地
      localStorage.setItem('visitor_phone', searchPhone.value)
    }
  } catch (e) {
    console.error('查询订单失败', e)
    orders.value = []
    hasQueried.value = true
  } finally {
    searching.value = false
    loading.value = false
  }
}

function resetSearch() {
  hasQueried.value = false
  orders.value = []
  searchPhone.value = ''
  phoneError.value = ''
  activeTab.value = 'all'
  activeType.value = 'all'
}

function handleLogout() {
  if (!confirm('确定要退出登录吗？')) return
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchLoggedInOrders()
    return
  }
  
  const phoneParam = route.query.phone as string
  if (phoneParam && /^1\d{10}$/.test(phoneParam)) {
    searchPhone.value = phoneParam
    handleSearch()
    return
  }
  
  const savedPhone = localStorage.getItem('visitor_phone')
  if (savedPhone && /^1\d{10}$/.test(savedPhone)) {
    searchPhone.value = savedPhone
    handleSearch()
  }
})

watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn && !hasQueried.value) {
    fetchLoggedInOrders()
  }
})

function openReview(order: any) {
  reviewOrder.value = order
  reviewRating.value = 5
  reviewContent.value = ''
  showReview.value = true
}

async function submitReview() {
  if (!reviewOrder.value) return
  submittingReview.value = true
  try {
    const res = await orderApi.submitReview(reviewOrder.value.id, reviewRating.value, reviewContent.value)
    if (res.code === 0) {
      // 更新本地订单状态
      const idx = orders.value.findIndex(o => o.id === reviewOrder.value.id)
      if (idx !== -1) orders.value[idx].reviewed = 1
      showReview.value = false
      alert('评价成功，感谢您的反馈！')
    } else {
      alert(res.message || '评价失败')
    }
  } catch (e: any) {
    alert('评价失败，请稍后重试')
  } finally {
    submittingReview.value = false
  }
}
</script>
