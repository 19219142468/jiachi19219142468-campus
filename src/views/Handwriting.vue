<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">写字服务</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">填写写字需求</h3>

        <form @submit.prevent="submitOrder" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">服务类型</label>
            <select v-model="form.serviceType" class="input-field" required>
              <option value="">请选择服务类型</option>
              <option value="homework">作业抄写</option>
              <option value="notes">笔记整理</option>
              <option value="letter">书信撰写</option>
              <option value="essay">作文/论文抄写</option>
              <option value="copy">资料抄写</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">字数</label>
            <div class="flex items-center gap-4">
              <button
                type="button"
                @click="form.wordCount > 100 && (form.wordCount -= 100)"
                class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <MinusIcon class="w-5 h-5" />
              </button>
              <input
                v-model.number="form.wordCount"
                type="number"
                min="100"
                step="100"
                class="w-32 text-center input-field"
              />
              <button
                type="button"
                @click="form.wordCount += 100"
                class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <PlusIcon class="w-5 h-5" />
              </button>
              <span class="text-gray-500">字</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">最少100字，每100字为单位</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">字体样式</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="font in fonts"
                :key="font.value"
                type="button"
                @click="form.font = font.value"
                :class="[
                  'p-3 rounded-xl border-2 text-center transition-all',
                  form.font === font.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <p :style="{ fontFamily: font.family }" class="text-base font-medium text-gray-800">
                  示例文字
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ font.label }}</p>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">上百种字体可选，以上为常用字体，特殊字体请在备注中说明</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">纸张类型</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.paper = 'a4'"
                :class="['p-3 rounded-xl border-2 text-center transition-all', form.paper === 'a4' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-sm font-medium text-gray-800">A4纸</p>
              </button>
              <button
                type="button"
                @click="form.paper = 'notebook'"
                :class="['p-3 rounded-xl border-2 text-center transition-all', form.paper === 'notebook' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-sm font-medium text-gray-800">作业本</p>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">抄写内容</label>
            <textarea
              v-model="form.content"
              rows="6"
              placeholder="请输入需要抄写的文字内容，或在下方上传文件"
              class="input-field"
              required
            ></textarea>
            <p class="text-xs text-gray-400 mt-1">请仔细核对内容，错字不负责（以您提供的内容为准）</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">备注要求</label>
            <textarea
              v-model="form.remark"
              rows="2"
              placeholder="特殊要求：如字体颜色、排版格式、是否需要装订等"
              class="input-field"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="请输入手机号码（用于接收订单通知）"
              maxlength="11"
              class="input-field"
              required
            />
            <p class="text-xs text-gray-400 mt-1">请输入11位手机号码，方便我们联系您</p>
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
                <p class="text-sm text-gray-500">加急费用 +5%，优先处理，24小时内完成</p>
              </div>
            </label>
          </div>

          <div class="bg-primary-50 rounded-xl p-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-600">服务费用</p>
                <p class="text-sm text-gray-400 mt-1">
                  {{ form.wordCount }}字 × ¥{{ pricePer100Words }}/百字
                  {{ form.urgent ? ' + 加急费' : '' }}
                </p>
              </div>
              <p class="text-2xl font-bold text-primary-600">¥{{ totalPrice.toFixed(2) }}</p>
            </div>
            <div class="mt-3 pt-3 border-t border-primary-200">
              <p class="text-sm text-primary-700">
                <InformationCircleIcon class="w-4 h-4 inline mr-1" />
                {{ form.urgent ? '加急订单：24小时内完成' : '普通订单：2-3天内完成' }}
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
            基础价格：每百字 ¥1.5，100字起算
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            上百种字体可选，可定制专属手写风格
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            普通订单2-3天完成，加急24小时内
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            内容错误以您提供的为准，不承担错字责任
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            可选择送货到宿舍或指定地点
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
import { ChevronLeftIcon, MinusIcon, PlusIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/vue/outline'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const fonts = [
  { value: 'regular', label: '标准手写', family: 'KaiTi, STKaiti, serif' },
  { value: 'neat', label: '工整楷体', family: 'KaiTi, STKaiti, serif' },
  { value: 'cute', label: '可爱圆体', family: 'YouYuan, "Microsoft YaHei", sans-serif' },
  { value: 'business', label: '商务行书', family: 'STXingkai, "华文行楷", cursive' },
  { value: 'girlish', label: '少女体', family: '"Microsoft YaHei", sans-serif' },
  { value: 'handwriting1', label: '工整手写', family: 'KaiTi, STKaiti, "Microsoft YaHei", serif' },
  { value: 'handwriting2', label: '清秀手写', family: 'STKaiti, "Microsoft YaHei", sans-serif' },
  { value: 'handwriting3', label: '普通手写', family: '"Microsoft YaHei", SimHei, sans-serif' }
]

const form = ref({
  serviceType: 'homework',
  wordCount: 500,
  font: 'regular',
  paper: 'a4' as 'a4' | 'notebook',
  content: '',
  urgent: false,
  remark: '',
  phone: ''
})

const pricePer100Words = ref(1.5)

const basePrice = computed(() => {
  const hundreds = Math.ceil(form.value.wordCount / 100)
  return hundreds * pricePer100Words.value
})

const totalPrice = computed(() => {
  if (form.value.urgent) {
    return parseFloat((basePrice.value * 1.05).toFixed(2))
  }
  return basePrice.value
})

onMounted(async () => {
  // 从后端拉取价格配置
  try {
    const res: any = await publicApi.getServicePrices()
    if (res.code === 0 && res.data) {
      if (res.data.handwriting_price) pricePer100Words.value = parseFloat(res.data.handwriting_price)
    }
  } catch (e) {}

  // 如果有保存的手机号，自动填充
  const savedPhone = localStorage.getItem('visitor_phone')
  if (savedPhone) {
    form.value.phone = savedPhone
  }
})

async function submitOrder() {
  if (!form.value.content.trim()) {
    error.value = '请输入抄写内容'
    return
  }
  if (!/^1\d{10}$/.test(form.value.phone)) {
    error.value = '请输入正确的手机号码'
    return
  }
  loading.value = true
  error.value = ''

  try {
    const loggedIn = await ensureLoggedIn(form.value.phone)
    if (!loggedIn) {
      error.value = '登录失败，请稍后重试'
      return
    }

    const res = await orderApi.createHandwritingOrder({
      service_type: form.value.serviceType,
      word_count: form.value.wordCount,
      font: form.value.font,
      paper: form.value.paper,
      content: form.value.content,
      urgent: form.value.urgent,
      remark: form.value.remark,
      phone: form.value.phone
    })

    if (res.code === 0 && res.data) {
      // 保存手机号到本地
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
