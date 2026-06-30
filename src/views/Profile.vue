<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
              <ChevronLeftIcon class="w-6 h-6" />
            </router-link>
            <h1 class="text-xl font-bold text-gray-800">个人中心</h1>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 手机号查询 -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">查询我的订单</h3>
        <div class="flex gap-3">
          <input
            v-model="searchPhone"
            type="tel"
            placeholder="输入手机号查看订单"
            maxlength="11"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            @click="handleSearchOrders"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            查询
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-2">输入您的手机号码，即可查看所有订单记录</p>
      </div>

      <!-- 已登录用户信息 -->
      <div v-if="userStore.isLoggedIn" class="card mb-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 text-2xl font-bold">{{ userStore.user?.nickname?.[0] || userStore.user?.phone?.[0] || 'U' }}</span>
          </div>
          <div class="flex-1">
            <p class="text-xl font-bold text-gray-800">{{ userStore.user?.nickname || '用户' }}</p>
            <p class="text-gray-500">{{ userStore.user?.phone }}</p>
          </div>
          <button @click="handleLogout" class="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            退出
          </button>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="card">
        <div class="divide-y divide-gray-100">
          <router-link 
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', item.bgColor]">
              <component :is="item.icon" :class="['w-5 h-5', item.iconColor]" />
            </div>
            <span class="flex-1 font-medium text-gray-800">{{ item.label }}</span>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </router-link>
        </div>
      </div>

      <!-- 管理员入口 -->
      <div v-if="userStore.user?.role === 'admin'" class="card mt-6">
        <router-link to="/admin" class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
            <CogIcon class="w-5 h-5 text-accent-600" />
          </div>
          <span class="flex-1 font-medium text-accent-600">管理后台</span>
          <ChevronRightIcon class="w-5 h-5 text-gray-400" />
        </router-link>
      </div>
    </main>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 shadow-2xl">
      <div class="flex justify-around py-2">
        <router-link to="/" class="flex flex-col items-center gap-1 text-gray-500">
          <HomeIcon class="w-6 h-6" />
          <span class="text-xs font-medium">首页</span>
        </router-link>
        <router-link to="/order" class="flex flex-col items-center gap-1 text-gray-500">
          <ClipboardListIcon class="w-6 h-6" />
          <span class="text-xs font-medium">订单</span>
        </router-link>
        <router-link to="/profile" class="flex flex-col items-center gap-1 text-orange-600">
          <UserIcon class="w-6 h-6" />
          <span class="text-xs font-medium">我的</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HomeIcon,
  ClipboardListIcon,
  UserIcon,
  LocationMarkerIcon,
  CreditCardIcon,
  ArrowRightIcon,
  CogIcon
} from '@heroicons/vue/outline'

const router = useRouter()
const userStore = useUserStore()
const searchPhone = ref('')

const menuItems = computed(() => [
  {
    path: '/order',
    label: '我的订单',
    icon: ClipboardListIcon,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    path: '/addresses',
    label: '收货地址',
    icon: LocationMarkerIcon,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  }
])

onMounted(() => {
  // 获取本地保存的手机号
  const savedPhone = localStorage.getItem('visitor_phone')
  if (savedPhone) {
    searchPhone.value = savedPhone
  }
})

function handleSearchOrders() {
  if (!searchPhone.value || !/^1\d{10}$/.test(searchPhone.value)) {
    alert('请输入正确的11位手机号码')
    return
  }
  // 跳转到订单页面
  router.push({ 
    path: '/order', 
    query: { phone: searchPhone.value } 
  })
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>
