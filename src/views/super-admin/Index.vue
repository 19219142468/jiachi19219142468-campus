<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <aside class="w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 text-white min-h-screen fixed shadow-xl">
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span class="text-white text-xl font-bold">S</span>
            </div>
            <div>
              <span class="text-lg font-bold block">超级管理员</span>
              <span class="text-xs text-white/60">总控后台</span>
            </div>
          </div>
        </div>
        
        <nav class="mt-6 px-3">
          <router-link 
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1',
              isActive(item.path) 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium flex-1">{{ item.label }}</span>
            <span 
              v-if="item.badge && pendingCount > 0" 
              class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
            >
              {{ pendingCount > 99 ? '99+' : pendingCount }}
            </span>
          </router-link>
        </nav>

        <div class="absolute bottom-0 w-full p-4 border-t border-white/10">
          <div class="flex items-center gap-3 px-2 py-3 mb-2">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1">
              <p class="text-white font-medium text-sm">{{ adminInfo?.nickname || '超级管理员' }}</p>
              <p class="text-white/60 text-xs">{{ adminInfo?.phone || '' }}</p>
            </div>
          </div>
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowRightIcon class="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 ml-64 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChartBarIcon,
  ClipboardListIcon,
  UsersIcon,
  UserIcon,
  CogIcon,
  CurrencyDollarIcon,
  CashIcon,
  ArrowRightIcon,
  BellIcon,
  ReceiptTaxIcon
} from '@heroicons/vue/outline'
import { superAdminApi } from '@/api'

const route = useRoute()
const router = useRouter()
const adminInfo = ref<any>(null)
const pendingCount = ref(0)

const menuItems = [
  { path: '/super-admin/dashboard', label: '数据看板', icon: ChartBarIcon },
  { path: '/super-admin/pending-confirm', label: '待确认收款', icon: BellIcon, badge: true },
  { path: '/super-admin/orders', label: '订单管理', icon: ClipboardListIcon },
  { path: '/super-admin/payment-records', label: '支付流水', icon: ReceiptTaxIcon },
  { path: '/super-admin/agents', label: '业务员管理', icon: UsersIcon },
  { path: '/super-admin/users', label: '用户管理', icon: UserIcon },
  { path: '/super-admin/services', label: '服务定价', icon: CogIcon },
  { path: '/super-admin/finance', label: '资金财务', icon: CurrencyDollarIcon },
  { path: '/super-admin/agent-withdrawals', label: '提现审核', icon: CashIcon }
]

async function fetchPendingCount() {
  try {
    const res = await superAdminApi.getPendingConfirmOrders()
    if (res.code === 0) {
      pendingCount.value = res.data.total || 0
    }
  } catch (e) {
    console.error('获取待确认数量失败', e)
  }
}

function isActive(path: string) {
  return route.path.startsWith(path)
}

function handleLogout() {
  localStorage.removeItem('super_admin_token')
  localStorage.removeItem('super_admin')
  router.push('/super-admin/login')
}

onMounted(() => {
  const stored = localStorage.getItem('super_admin')
  if (stored) {
    adminInfo.value = JSON.parse(stored)
  }
  
  // 获取待确认订单数量
  fetchPendingCount()
  
  // 每30秒刷新一次待确认数量
  setInterval(fetchPendingCount, 30000)
})
</script>
