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

      <!-- 注册卡片 -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">创建账号</h2>
        
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <div class="flex gap-2">
              <input 
                v-model="form.phone" 
                type="tel" 
                maxlength="11"
                placeholder="请输入手机号"
                class="input-field flex-1"
                required
              />
              <button 
                type="button"
                @click="sendCode"
                :disabled="countdown > 0"
                class="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">验证码</label>
            <input 
              v-model="form.code" 
              type="text" 
              maxlength="6"
              placeholder="请输入验证码"
              class="input-field"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">设置密码</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="请设置登录密码（6位以上）"
              class="input-field"
              required
              minlength="6"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              class="input-field"
              required
            />
          </div>

          <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {{ error }}
          </div>

          <div v-if="success" class="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
            {{ success }}
          </div>

          <button 
            type="submit" 
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-500 text-sm">
            已有账号？ 
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
              立即登录
            </router-link>
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
import { authApi } from '@/api'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const error = ref('')
const success = ref('')
const countdown = ref(0)

async function sendCode() {
  if (!form.value.phone || form.value.phone.length !== 11) {
    error.value = '请输入正确的手机号'
    return
  }
  
  try {
    const res = await authApi.sendCode(form.value.phone)
    if (res.code === 0) {
      success.value = '验证码已发送'
      error.value = ''
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      error.value = res.message || '发送失败'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || '发送失败'
  }
}

async function handleRegister() {
  error.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次密码输入不一致'
    return
  }
  
  if (form.value.password.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }
  
  loading.value = true
  
  try {
    const result = await userStore.register(form.value.phone, form.value.code, form.value.password)
    if (result) {
      router.push('/')
    } else {
      error.value = '注册失败，请检查验证码是否正确'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
