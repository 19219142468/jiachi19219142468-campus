<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-bold">A</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">业务员接单后台</h1>
          <p class="text-gray-500 mt-2">校园服务接单平台</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">账号</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入登录账号"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <p v-if="error" class="text-red-500 text-sm text-center mt-4">{{ error }}</p>

        <div class="mt-6 pt-6 border-t border-gray-100 text-center">
          <router-link to="/" class="text-sm text-gray-500 hover:text-emerald-600">
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
import { agentApi } from '@/api'

const router = useRouter()
const username = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value) {
    error.value = '请输入账号'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await agentApi.login(username.value)
    if (res.code === 0) {
      localStorage.setItem('agent_token', res.data.token)
      localStorage.setItem('agent', JSON.stringify(res.data.agent))
      router.push('/agent/dashboard')
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
