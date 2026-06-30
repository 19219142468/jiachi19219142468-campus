<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3">
          <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <span class="text-primary-600 text-2xl font-bold">C</span>
          </div>
          <span class="text-white text-2xl font-bold">校园服务</span>
        </div>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">欢迎回来</h2>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input 
              v-model="form.phone" 
              type="tel" 
              maxlength="11"
              placeholder="请输入11位手机号"
              class="input-field"
              required
            />
          </div>
          
          <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading">登录中...</span>
            <span v-else>登录 / 注册</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-400 text-xs">
            输入手机号即可登录，未注册将自动注册账号
          </p>
        </div>
      </div>

      <p class="text-center text-primary-200 text-sm mt-6">
        <router-link to="/" class="hover:text-white transition-colors">返回首页</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  phone: ''
})
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  
  if (!/^1\d{10}$/.test(form.value.phone)) {
    error.value = '请输入正确的11位手机号码'
    return
  }
  
  loading.value = true
  
  try {
    const success = await userStore.login(form.value.phone, '')
    if (success) {
      router.push('/')
    } else {
      error.value = '登录失败，请稍后重试'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
