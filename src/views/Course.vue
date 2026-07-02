<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">课业时长整理服务</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">填写课程信息</h3>
        
        <form @submit.prevent="submitOrder" class="space-y-6">
          <!-- 平台名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">网课平台</label>
            <input 
              v-model="form.platform"
              type="text"
              placeholder="请输入平台名称，如：学某通、知某、智某某教、学堂某某等"
              class="input-field"
              required
            />
          </div>

          <!-- 课程名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">课程名称</label>
            <input 
              v-model="form.courseName"
              type="text"
              placeholder="请输入课程名称"
              class="input-field"
              required
            />
          </div>

          <!-- 账号 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">登录账号</label>
            <input 
              v-model="form.account"
              type="tel"
              placeholder="请输入11位手机号码"
              maxlength="11"
              class="input-field"
              required
              @input="validatePhone"
            />
            <p class="text-xs text-gray-400 mt-2">请输入11位手机号码，用于登录网课平台</p>
            <p v-if="phoneError" class="text-xs text-red-500 mt-1">{{ phoneError }}</p>
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">登录密码</label>
            <input 
              v-model="form.password"
              type="password"
              placeholder="请输入登录密码"
              class="input-field"
              required
            />
            <p class="text-xs text-gray-400 mt-2">密码将加密存储，仅用于登录代刷</p>
          </div>

          <!-- 是否加急 -->
          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input 
                v-model="form.urgent"
                type="checkbox"
                class="w-5 h-5 text-primary-600 rounded"
              />
              <div>
                <span class="font-medium text-gray-800">加急服务</span>
                <p class="text-sm text-gray-500">加急费用 +1元，优先处理</p>
              </div>
            </label>
          </div>

          <!-- 价格说明 -->
          <div class="bg-primary-50 rounded-xl p-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-600">服务费用</p>
                <p class="text-sm text-gray-400 mt-1">基础费用 ¥{{ basePrice }} × {{ courseCount }}门 + 加急 ¥{{ form.urgent ? urgentPrice : '0' }}</p>
              </div>
              <p class="text-2xl font-bold text-primary-600">¥{{ totalPrice.toFixed(2) }}</p>
            </div>
            <div class="mt-3 pt-3 border-t border-primary-200">
              <p class="text-sm text-primary-700">
                <InformationCircleIcon class="w-4 h-4 inline mr-1" />
                100%完成度，正常情况下24小时内完成
              </p>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {{ error }}
          </div>

          <button 
            type="submit"
            :disabled="loading || !!phoneError"
            class="btn-primary w-full"
          >
            <span v-if="loading">提交中...</span>
            <span v-else>提交订单</span>
          </button>
        </form>
      </div>

      <!-- 注意事项 -->
      <div class="card mt-6">
        <h4 class="font-semibold text-gray-800 mb-3">注意事项</h4>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            请确保账号信息准确，否则可能导致登录失败
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            平台会定期修改密码或触发风控，建议使用备用账号
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            完成进度可联系客服查询
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            如遇平台风控导致无法完成，将全额退款
          </li>
        </ul>
      </div>
    </main>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi, publicApi } from '@/api'
import { ensureLoggedIn } from '@/utils/auth-helper'
import { ChevronLeftIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/vue/outline'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const phoneError = ref('')

const basePrice = ref(1.7)
const urgentPrice = ref(1)
const courseCount = 1

const form = ref({
  platform: '',
  courseName: '',
  account: '',
  password: '',
  urgent: false
})

onMounted(async () => {
  try {
    const res: any = await publicApi.getServicePrices()
    if (res.code === 0 && res.data) {
      if (res.data.course_base_price) {
        basePrice.value = parseFloat(res.data.course_base_price)
      }
      if (res.data.course_urgent_price) {
        urgentPrice.value = parseFloat(res.data.course_urgent_price)
      }
    }
  } catch (e) {}
})

const totalPrice = computed(() => {
  const base = basePrice.value * courseCount
  const urgent = form.value.urgent ? urgentPrice.value : 0
  return base + urgent
})

function validatePhone() {
  const phone = form.value.account
  if (phone.length > 0 && phone.length !== 11) {
    phoneError.value = '请输入11位手机号码'
  } else if (phone.length === 11) {
    // 验证是否为有效手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      phoneError.value = '手机号码格式不正确，请检查'
    } else {
      phoneError.value = ''
    }
  } else {
    phoneError.value = ''
  }
}

async function submitOrder() {
  // 提交前再次验证
  validatePhone()
  if (phoneError.value) {
    error.value = '请输入正确的11位手机号码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const loggedIn = await ensureLoggedIn(form.value.account)
    if (!loggedIn) {
      error.value = '登录失败，请稍后重试'
      return
    }

    const res = await orderApi.createCourseOrder({
      platform: form.value.platform,
      course_name: form.value.courseName,
      account: form.value.account,
      password: form.value.password,
      urgent: form.value.urgent
    })
    
    if (res.code === 0 && res.data) {
      // 保存手机号到本地
      if (form.value.account) {
        localStorage.setItem('visitor_phone', form.value.account)
      }
      router.push(`/pay/${res.data.id}`)
    } else {
      error.value = res.message || '创建订单失败'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || '创建订单失败'
  } finally {
    loading.value = false
  }
}
</script>
