<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex">
      <!-- 侧边栏 -->
      <aside class="w-64 bg-gray-900 text-white min-h-screen fixed">
        <div class="p-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span class="text-white text-xl font-bold">C</span>
            </div>
            <span class="text-xl font-bold">管理后台</span>
          </div>
        </div>
        
        <nav class="mt-6">
          <router-link 
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="['flex items-center gap-3 px-6 py-3 transition-colors', isActive(item.path) ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800']"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="absolute bottom-0 w-full p-6 border-t border-gray-800">
          <router-link to="/" class="flex items-center gap-3 text-gray-400 hover:text-white">
            <HomeIcon class="w-5 h-5" />
            <span>返回首页</span>
          </router-link>
        </div>
      </aside>

      <!-- 主内容 -->
      <main class="flex-1 ml-64 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { 
  HomeIcon,
  ChartBarIcon,
  ClipboardListIcon,
  UsersIcon,
  CogIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/outline'

const route = useRoute()

const menuItems = [
  { path: '/admin/dashboard', label: '数据概览', icon: ChartBarIcon },
  { path: '/admin/orders', label: '订单管理', icon: ClipboardListIcon },
  { path: '/admin/users', label: '用户管理', icon: UsersIcon },
  { path: '/admin/services', label: '服务设置', icon: CogIcon },
  { path: '/admin/finance', label: '财务报表', icon: CurrencyDollarIcon },
  { path: '/admin/withdraw', label: '提现管理', icon: CurrencyDollarIcon }
]

function isActive(path: string) {
  return route.path === path
}
</script>
