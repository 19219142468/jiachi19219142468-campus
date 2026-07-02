<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24">
    <div class="text-center">
      <div class="text-8xl md:text-9xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-4">404</div>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">页面走丢了</h1>
      <p class="text-gray-500 mb-8">您访问的页面不存在或已被移除</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          @click="goBack"
          class="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          返回上一页
        </button>
        <button 
          @click="goHome"
          class="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium shadow-md shadow-orange-200"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>

  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 shadow-2xl">
    <div class="flex justify-around py-2">
      <router-link to="/" class="flex flex-col items-center gap-1 text-orange-600">
        <HomeIcon class="w-6 h-6" />
        <span class="text-xs font-medium">首页</span>
      </router-link>
      <router-link to="/order" class="flex flex-col items-center gap-1 text-gray-500">
        <ClipboardListIcon class="w-6 h-6" />
        <span class="text-xs font-medium">订单</span>
      </router-link>
      <router-link to="/profile" class="flex flex-col items-center gap-1 text-gray-500">
        <UserIcon class="w-6 h-6" />
        <span class="text-xs font-medium">我的</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeIcon, ClipboardListIcon, UserIcon } from '@heroicons/vue/outline'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function goHome() {
  router.push('/')
}
</script>
