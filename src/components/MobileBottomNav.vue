<template>
  <!-- 移动端底部导航 -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 shadow-2xl">
    <div class="flex justify-around py-2">
      <router-link to="/" class="flex flex-col items-center gap-1" :class="isActive('/') ? 'text-orange-600' : 'text-gray-500'">
        <HomeIcon class="w-6 h-6" />
        <span class="text-xs font-medium">首页</span>
      </router-link>
      <router-link to="/order" class="flex flex-col items-center gap-1" :class="isActive('/order') ? 'text-orange-600' : 'text-gray-500'">
        <ClipboardListIcon class="w-6 h-6" />
        <span class="text-xs font-medium">订单</span>
      </router-link>
      <button @click="showContact = true" class="flex flex-col items-center gap-1 text-gray-500">
        <ChatAltIcon class="w-6 h-6" />
        <span class="text-xs font-medium">客服</span>
      </button>
      <router-link to="/profile" class="flex flex-col items-center gap-1" :class="isActive('/profile') ? 'text-orange-600' : 'text-gray-500'">
        <UserIcon class="w-6 h-6" />
        <span class="text-xs font-medium">我的</span>
      </router-link>
    </div>
  </nav>

  <!-- 客服弹窗 -->
  <div v-if="showContact" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" @click.self="showContact = false">
    <div class="bg-white rounded-2xl w-full max-w-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">联系客服</h3>
        <button @click="showContact = false" class="text-gray-400 hover:text-gray-600">
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="text-center py-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChatAltIcon class="w-8 h-8 text-green-600" />
        </div>
        <p class="text-sm text-gray-500 mb-2">微信号</p>
        <p class="text-lg font-bold text-gray-800 mb-4 tracking-wide">wxid_jv428py2ftir22</p>
        <button
          @click="copyWechat"
          class="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <DocumentDuplicateIcon class="w-5 h-5" />
          {{ copied ? '已复制' : '一键复制微信号' }}
        </button>
        <p class="text-xs text-gray-400 mt-4">复制微信号后，在微信中搜索添加好友</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  ClipboardListIcon,
  ChatAltIcon,
  UserIcon,
  XIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/outline'

const route = useRoute()
const showContact = ref(false)
const copied = ref(false)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

async function copyWechat() {
  try {
    await navigator.clipboard.writeText('wxid_jv428py2ftir22')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // 降级方案
    const input = document.createElement('input')
    input.value = 'wxid_jv428py2ftir22'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>
