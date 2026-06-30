<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-bold">S</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">超级管理员后台</h1>
          <p class="text-gray-500 mt-2">校园服务平台管理中心</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <p v-if="error" class="text-red-500 text-sm text-center mt-4">{{ error }}</p>

        <div class="mt-6 pt-6 border-t border-gray-100 text-center">
          <router-link to="/" class="text-sm text-gray-500 hover:text-indigo-600">
            ← 返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { superAdminApi } from '@/api'

const router = useRouter()
const phone = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!phone.value || phone.value.length !== 11) {
    error.value = '请输入正确的11位手机号'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await superAdminApi.login(phone.value)
    if (res.code === 0) {
      localStorage.setItem('super_admin_token', res.data.token)
      localStorage.setItem('super_admin', JSON.stringify(res.data.user))
      router.push('/super-admin/dashboard')
    } else {
      error.value = res.message || '登录失败'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
