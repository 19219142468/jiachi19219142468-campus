<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <aside class="w-64 bg-gradient-to-b from-emerald-800 via-teal-800 to-cyan-800 text-white min-h-screen fixed shadow-xl flex flex-col">
        <div class="p-6 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span class="text-white text-xl font-bold">A</span>
            </div>
            <div>
              <span class="text-lg font-bold block">接单工作台</span>
              <span class="text-xs text-white/60">业务员后台</span>
            </div>
          </div>
        </div>
        
        <nav class="mt-6 px-3 flex-1 overflow-y-auto pb-40">
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
            <span class="font-medium">{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="absolute bottom-0 left-0 w-full p-4 border-t border-white/10 bg-gradient-to-t from-cyan-800 to-transparent">
          <div class="flex items-center gap-3 px-2 py-3 mb-2">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium text-sm truncate">{{ agentInfo?.name || '业务员' }}</p>
              <p class="text-white/60 text-xs truncate">{{ agentInfo?.username || '' }}</p>
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
  CollectionIcon,
  UserIcon,
  CogIcon,
  ArrowRightIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/outline'

const route = useRoute()
const router = useRouter()
const agentInfo = ref<any>(null)

const menuItems = [
  { path: '/agent/dashboard', label: '工作台', icon: ChartBarIcon },
  { path: '/agent/pool', label: '订单池', icon: CollectionIcon },
  { path: '/agent/orders', label: '我的订单', icon: ClipboardListIcon },
  { path: '/agent/wallet', label: '我的钱包', icon: CurrencyDollarIcon },
  { path: '/agent/profile', label: '个人中心', icon: CogIcon }
]

function isActive(path: string) {
  return route.path.startsWith(path)
}

function handleLogout() {
  localStorage.removeItem('agent_token')
  localStorage.removeItem('agent')
  router.push('/agent/login')
}

onMounted(() => {
  const stored = localStorage.getItem('agent')
  if (stored) {
    agentInfo.value = JSON.parse(stored)
  }
})
</script>
