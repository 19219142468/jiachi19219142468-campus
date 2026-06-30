<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">校内包裹配送服务</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">填写快递信息</h3>

        <form @submit.prevent="submitOrder" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">快递大小</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="form.size = 'small'"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.size === 'small' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-lg font-semibold text-gray-800">小件</p>
                <p class="text-primary-600 font-bold mt-1">¥1.2起</p>
              </button>
              <button
                type="button"
                @click="form.size = 'large'"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.size === 'large' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-lg font-semibold text-gray-800">大件</p>
                <p class="text-primary-600 font-bold mt-1">¥2.5起</p>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">取件码</label>
            <input
              v-model="form.pickupCode"
              type="text"
              placeholder="请输入取件码"
              class="input-field"
              required
            />
            <p class="text-xs text-gray-400 mt-1">复制快递取件码粘贴在这里（取件码或快递单号）</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">收货人姓名</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入收货人姓名"
              class="input-field"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="请输入手机号码"
              maxlength="11"
              class="input-field"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">送货地址</label>
            <input
              v-model="form.deliveryAddress"
              type="text"
              placeholder="如：1号公寓3楼301宿舍 或 教学楼A栋202教室"
              class="input-field"
              required
            />
            <p class="text-xs text-gray-400 mt-1">填写教室或公寓宿舍号（如：X号公寓X楼XXX号宿舍）</p>
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="form.urgent"
                type="checkbox"
                class="w-5 h-5 text-primary-600 rounded"
              />
              <div>
                <span class="font-medium text-gray-800">加急服务</span>
                <p class="text-sm text-gray-500">
                  小件加急 +0.8元，当天下午送到；大件加急 +1.5元
                </p>
              </div>
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">备注信息</label>
            <textarea
              v-model="form.remark"
              rows="2"
              placeholder="选填，如：易碎物品、轻拿轻放等"
              class="input-field"
            ></textarea>
          </div>

          <div class="bg-primary-50 rounded-xl p-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-600">服务费用</p>
                <p class="text-sm text-gray-400 mt-1">
                  {{ form.size === 'small' ? '小件' : '大件' }}
                  {{ form.urgent ? '加急' : '普通' }}
                </p>
              </div>
              <p class="text-2xl font-bold text-primary-600">¥{{ totalPrice.toFixed(2) }}</p>
            </div>
            <div class="mt-3 pt-3 border-t border-primary-200">
              <p class="text-sm text-primary-700">
                <InformationCircleIcon class="w-4 h-4 inline mr-1" />
                {{ deliveryTime }}
              </p>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full"
          >
            <span v-if="loading">提交中...</span>
            <span v-else>提交订单</span>
          </button>
        </form>
      </div>

      <div class="card mt-6">
        <h4 class="font-semibold text-gray-800 mb-3">服务说明</h4>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            小件普通：下单后第二天下午之前送到
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            小件加急：当天下午送到（15点前下单）
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            大件标准：24小时内送达
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            快递丢失或损坏，全额赔付
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '@/api'
import { ensureLoggedIn } from '@/utils/auth-helper'
import { ChevronLeftIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/vue/outline'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = ref({
  size: 'small' as 'small' | 'large',
  pickupCode: '',
  name: '',
  phone: '',
  deliveryAddress: '',
  urgent: false,
  remark: ''
})

const basePrice = computed(() => {
  if (form.value.size === 'small') {
    return 0.1
  }
  return 2.5
})

const urgentPrice = computed(() => {
  if (form.value.size === 'small') {
    return form.value.urgent ? 0.8 : 0
  }
  return form.value.urgent ? 1.5 : 0
})

const totalPrice = computed(() => basePrice.value + urgentPrice.value)

const deliveryTime = computed(() => {
  if (form.value.size === 'small' && form.value.urgent) {
    return '加急配送：当天下午送到（15点前下单）'
  }
  if (form.value.size === 'small' && !form.value.urgent) {
    return '普通配送：第二天下午之前送到'
  }
  if (form.value.size === 'large' && form.value.urgent) {
    return '加急配送：当天下午送到（15点前下单）'
  }
  return '普通配送：24小时内送达'
})

onMounted(() => {
  // 如果有保存的手机号，自动填充
  const savedPhone = localStorage.getItem('visitor_phone')
  if (savedPhone) {
    form.value.phone = savedPhone
  }
})

async function submitOrder() {
  error.value = ''

  if (!/^1\d{10}$/.test(form.value.phone)) {
    error.value = '请输入正确的手机号码'
    return
  }

  loading.value = true

  try {
    const loggedIn = await ensureLoggedIn(form.value.phone)
    if (!loggedIn) {
      error.value = '登录失败，请稍后重试'
      return
    }
    
    const res = await orderApi.createExpressOrder({
      size: form.value.size,
      pickup_code: form.value.pickupCode,
      name: form.value.name,
      phone: form.value.phone,
      delivery_address: form.value.deliveryAddress,
      urgent: form.value.urgent,
      remark: form.value.remark
    })

    if (res.code === 0 && res.data) {
      localStorage.setItem('visitor_phone', form.value.phone)
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
