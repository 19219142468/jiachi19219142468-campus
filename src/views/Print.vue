<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">文件打印</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 步骤指示器 -->
      <div class="flex items-center justify-center mb-8">
        <div class="flex items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500']">1</div>
          <div :class="['w-16 h-0.5', step >= 2 ? 'bg-primary-600' : 'bg-gray-200']"></div>
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500']">2</div>
          <div :class="['w-16 h-0.5', step >= 3 ? 'bg-primary-600' : 'bg-gray-200']"></div>
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500']">3</div>
        </div>
      </div>

      <!-- 步骤1: 上传文件 -->
      <div v-show="step === 1" class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">上传文件</h3>
          <div 
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            :class="['border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer', isDragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400']"
            @click="triggerFileInput"
          >
            <input 
              ref="fileInput"
              type="file" 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              class="hidden"
              @change="handleFileChange"
            />
            <UploadIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 mb-2">拖拽文件到此处，或点击上传</p>
            <p class="text-sm text-gray-400">支持 PDF、Word、图片格式</p>
          </div>

          <!-- 已上传文件 -->
          <div v-if="file" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <DocumentIcon class="w-8 h-8 text-primary-600" />
              <div class="flex-1">
                <p class="font-medium text-gray-800">{{ file.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(file.size) }}
                  <span v-if="pageCount > 0" class="ml-2 text-primary-600">
                    ({{ pageCount }}页)
                  </span>
                  <span v-if="isLoadingPages" class="ml-2 text-gray-400">
                    正在识别页数...
                  </span>
                </p>
              </div>
              <button @click="file = null; pageCount = 0" class="text-gray-400 hover:text-red-500">
                <XCircleIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <button 
          @click="nextStep"
          :disabled="!file"
          class="btn-primary w-full"
        >
          下一步
        </button>
      </div>

      <!-- 步骤2: 打印设置 -->
      <div v-show="step === 2" class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">打印设置</h3>
          
          <!-- 打印类型 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">打印类型</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="form.printType = 'black'"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.printType === 'black' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-lg font-semibold text-gray-800">黑白打印</p>
                <p class="text-primary-600 font-bold mt-1">¥{{ priceStore.getPrice('black_print_price', 0.3).toFixed(2) }}/张</p>
              </button>
              <button 
                @click="form.printType = 'color'"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.printType === 'color' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-lg font-semibold text-gray-800">彩色打印</p>
                <p class="text-primary-600 font-bold mt-1">¥{{ priceStore.getPrice('color_print_price', 0.5).toFixed(2) }}/张</p>
              </button>
            </div>
          </div>

          <!-- 纸张大小 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">纸张大小</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="form.pages = 1"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.pages === 1 ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="font-semibold text-gray-800">A4</p>
              </button>
              <button 
                @click="form.pages = 2"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.pages === 2 ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="font-semibold text-gray-800">A3</p>
              </button>
            </div>
          </div>

          <!-- 单双面 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">单双面</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="form.sides = 'single'"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.sides === 'single' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="font-semibold text-gray-800">单面</p>
              </button>
              <button 
                @click="form.sides = 'double'"
                :class="['p-4 rounded-xl border-2 text-center transition-all', form.sides === 'double' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="font-semibold text-gray-800">双面</p>
              </button>
            </div>
          </div>

          <!-- 份数 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">份数</label>
            <div class="flex items-center gap-4">
              <button 
                @click="form.copies > 1 && form.copies--"
                class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <MinusIcon class="w-5 h-5" />
              </button>
              <input 
                v-model.number="form.copies"
                type="number"
                min="1"
                class="w-20 text-center input-field"
              />
              <button 
                @click="form.copies++"
                class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <PlusIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- 装订方式 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">装订方式</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                v-for="option in bindingOptions"
                :key="option.value"
                @click="form.binding = option.value"
                :class="['p-3 rounded-lg border-2 text-center transition-all', form.binding === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-sm font-medium text-gray-800">{{ option.label }}</p>
              </button>
            </div>
          </div>

          <!-- 收货信息 -->
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-gray-800 pt-2 border-t border-gray-100">收货信息</h3>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">收货地址</label>
              <input
                v-model="form.deliveryAddress"
                type="text"
                placeholder="如：1号公寓3楼301宿舍 或 教学楼A栋202教室"
                class="input-field"
                required
              />
              <p class="text-xs text-gray-400 mt-1">填写教室或公寓宿舍号（如：X号公寓X楼XXX号宿舍）</p>
            </div>
          </div>
        </div>

        <!-- 价格预览 -->
        <div class="card bg-primary-50 border-primary-200">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">应付金额</span>
            <span class="text-2xl font-bold text-primary-600">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            {{ file?.name }} × {{ form.copies }}份 | {{ pageCount > 0 ? pageCount + '页' : '' }} | {{ form.printType === 'black' ? '黑白' : '彩色' }} | {{ form.sides === 'single' ? '单面' : '双面' }}
          </p>
        </div>

        <div class="flex gap-4">
          <button @click="step = 1" class="btn-secondary flex-1">上一步</button>
          <button @click="nextStep" class="btn-primary flex-1">下一步</button>
        </div>
      </div>

      <!-- 步骤3: 确认订单 -->
      <div v-show="step === 3" class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">确认订单</h3>
          
          <!-- 收货信息 -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-700 mb-3">收货信息</h4>
            <div class="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">收货人</span>
                <span class="text-gray-800">{{ form.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">手机号码</span>
                <span class="text-gray-800">{{ form.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">收货地址</span>
                <span class="text-gray-800">{{ form.deliveryAddress }}</span>
              </div>
            </div>
          </div>

          <!-- 订单摘要 -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h4 class="font-medium text-gray-700 mb-3">订单详情</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">文件</span>
                <span class="text-gray-800">{{ file?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">打印类型</span>
                <span class="text-gray-800">{{ form.printType === 'black' ? '黑白打印' : '彩色打印' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">纸张大小</span>
                <span class="text-gray-800">{{ form.pages === 1 ? 'A4' : 'A3' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">单双面</span>
                <span class="text-gray-800">{{ form.sides === 'single' ? '单面' : '双面' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">份数</span>
                <span class="text-gray-800">× {{ form.copies }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">装订方式</span>
                <span class="text-gray-800">{{ bindingLabels[form.binding] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">支付方式</h3>
          <div class="space-y-3">
            <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
              <input v-model="form.payMethod" type="radio" value="alipay" class="w-5 h-5 text-primary-600" />
              <span class="font-medium">支付宝</span>
            </label>
            <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
              <input v-model="form.payMethod" type="radio" value="wechat" class="w-5 h-5 text-primary-600" />
              <span class="font-medium">微信支付</span>
            </label>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {{ error }}
        </div>

        <div class="flex gap-4">
          <button @click="step = 2" class="btn-secondary flex-1">上一步</button>
          <button @click="submitOrder" :disabled="loading" class="btn-primary flex-1">
            <span v-if="loading">提交中...</span>
            <span v-else>去支付 ¥{{ totalPrice.toFixed(2) }}</span>
          </button>
        </div>
      </div>
    </main>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi, uploadApi } from '@/api'
import { ensureLoggedIn } from '@/utils/auth-helper'
import { UploadIcon, DocumentIcon, XCircleIcon, ChevronLeftIcon, MinusIcon, PlusIcon } from '@heroicons/vue/outline'
import { usePriceStore } from '@/stores/price'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

const router = useRouter()
const priceStore = usePriceStore()
const step = ref(1)
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const loading = ref(false)
const error = ref('')
const pageCount = ref(0)
const isLoadingPages = ref(false)

const form = ref({
  printType: 'black' as 'black' | 'color',
  pages: 1,
  sides: 'single' as 'single' | 'double',
  copies: 1,
  binding: 'none' as 'none' | 'staple',
  name: '',
  phone: '',
  deliveryAddress: '',
  payMethod: 'alipay'
})

const bindingOptions = [
  { value: 'none', label: '不装订' },
  { value: 'staple', label: '订书钉' }
]

const bindingLabels: Record<string, string> = {
  none: '不装订',
  staple: '订书钉'
}

const minPickupTime = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  return now.toISOString().slice(0, 16)
})

const unitPrice = computed(() => 
  form.value.printType === 'black' 
    ? priceStore.getPrice('black_print_price', 0.3) 
    : priceStore.getPrice('color_print_price', 0.5)
)

const totalPrice = computed(() => {
  const bindingPrice = form.value.binding === 'staple' ? 0.5 : 0
  const pages = pageCount.value > 0 ? pageCount.value : 1
  return parseFloat(((unitPrice.value + bindingPrice) * pages * form.value.copies).toFixed(2))
})

onMounted(async () => {
  priceStore.fetchPrices()
  const savedPhone = localStorage.getItem('visitor_phone')
  if (savedPhone) {
    form.value.phone = savedPhone
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    file.value = target.files[0]
    pageCount.value = 0
    isLoadingPages.value = true
    getPdfPageCount(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const droppedFile = e.dataTransfer?.files?.[0]
  if (droppedFile) {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
    if (validTypes.includes(droppedFile.type)) {
      file.value = droppedFile
      pageCount.value = 0
      isLoadingPages.value = true
      getPdfPageCount(droppedFile)
    }
  }
}

// 识别PDF页数
async function getPdfPageCount(file: File) {
  if (file.type === 'application/pdf') {
    try {
      const pdfjs = (window as any).pdfjsLib
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
        pageCount.value = pdf.numPages
      }
    } catch (e) {
      console.error('PDF解析失败:', e)
      pageCount.value = 1
    }
  } else {
    pageCount.value = 1
  }
  isLoadingPages.value = false
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function nextStep() {
  if (step.value === 1 && !file.value) return
  if (step.value === 2) {
    if (!form.value.name || !form.value.phone || !form.value.deliveryAddress) {
      error.value = '请填写完整的收货信息'
      return
    }
    if (!/^1\d{10}$/.test(form.value.phone)) {
      error.value = '请输入正确的手机号码'
      return
    }
  }
  error.value = ''
  step.value++
}

async function submitOrder() {
  if (!file.value) return
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

    // 先上传文件到服务器
    let fileUrl = ''
    if (file.value) {
      try {
        const uploadRes = await uploadApi.uploadFile(file.value)
        if (uploadRes.code === 0 && uploadRes.data?.url) {
          fileUrl = uploadRes.data.url
        } else {
          error.value = uploadRes.message || '文件上传失败，请重试'
          return
        }
      } catch (e) {
        error.value = '文件上传失败，请检查网络后重试'
        return
      }
    }

    const res = await orderApi.createPrintOrder({
      items: [{
        file_url: fileUrl,
        file_name: file.value.name,
        print_type: form.value.printType,
        pages: pageCount.value > 0 ? pageCount.value : form.value.pages,
        sides: form.value.sides,
        copies: form.value.copies,
        binding: form.value.binding
      }],
      name: form.value.name,
      phone: form.value.phone,
      delivery_address: form.value.deliveryAddress,
      pay_method: form.value.payMethod
    })
    
    if (res.code === 0 && res.data) {
      // 保存手机号到本地
      if (form.value.phone) {
        localStorage.setItem('visitor_phone', form.value.phone)
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
