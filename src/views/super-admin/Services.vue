<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">服务定价</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">文件打印</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">黑白打印单价（元/页）</label>
            <input 
              v-model="configs.black_print_price"
              type="number" 
              step="0.01"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">彩色打印单价（元/页）</label>
            <input 
              v-model="configs.color_print_price"
              type="number" 
              step="0.01"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">课业时长整理服务</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">基础价格（元）</label>
            <input 
              v-model="configs.course_base_price"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">加急费（元）</label>
            <input 
              v-model="configs.course_urgent_price"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">校内包裹配送服务</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">小件基础价（元）</label>
            <input 
              v-model="configs.express_small_price"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">大件基础价（元）</label>
            <input 
              v-model="configs.express_large_price"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">小件加急费（元）</label>
            <input 
              v-model="configs.express_small_urgent"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">大件加急费（元）</label>
            <input 
              v-model="configs.express_large_urgent"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">写字服务</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">每百字价格（元）</label>
            <input 
              v-model="configs.handwriting_price"
              type="number" 
              step="0.1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">加急费率（如0.05表示5%）</label>
            <input 
              v-model="configs.handwriting_urgent_rate"
              type="number" 
              step="0.01"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">收款方式设置</h3>
        <p class="text-sm text-gray-500 mb-4">设置您的个人收款码，用户下单时扫码转账付款</p>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">支付宝收款码</label>
            <div class="flex items-start gap-4">
              <div class="relative">
                <img v-if="configs.alipay_qrcode" :src="configs.alipay_qrcode" class="w-28 h-28 rounded-xl border-2 border-blue-200 object-cover" />
                <div v-else class="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50">
                  <div class="text-center">
                    <CameraIcon class="w-8 h-8 mx-auto mb-1" />
                    <span class="text-xs">点击上传</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload($event, 'alipay')"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div class="flex-1">
                <input 
                  v-model="configs.alipay_qrcode"
                  type="text" 
                  placeholder="或输入支付宝收款码图片URL"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p class="text-xs text-gray-400 mt-2">
                  👆 点击左侧区域上传收款码图片，支持 JPG/PNG 格式
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">微信收款码</label>
            <div class="flex items-start gap-4">
              <div class="relative">
                <img v-if="configs.wechat_qrcode" :src="configs.wechat_qrcode" class="w-28 h-28 rounded-xl border-2 border-green-200 object-cover" />
                <div v-else class="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50">
                  <div class="text-center">
                    <CameraIcon class="w-8 h-8 mx-auto mb-1" />
                    <span class="text-xs">点击上传</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload($event, 'wechat')"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div class="flex-1">
                <input 
                  v-model="configs.wechat_qrcode"
                  type="text" 
                  placeholder="或输入微信收款码图片URL"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <p class="text-xs text-gray-400 mt-2">
                  👆 点击左侧区域上传收款码图片，支持 JPG/PNG 格式
                </p>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">支付宝账号（备用）</label>
              <input 
                v-model="configs.admin_alipay"
                type="text" 
                placeholder="如：13800138000@163.com"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">微信账号（备用）</label>
              <input 
                v-model="configs.admin_wechat"
                type="text" 
                placeholder="如：wx123456"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <button 
        @click="fetchConfigs" 
        class="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
      >
        重置
      </button>
      <button 
        @click="saveAll" 
        :disabled="saving"
        class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ saving ? '保存中...' : '保存所有配置' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { superAdminApi } from '@/api'
import { CameraIcon } from '@heroicons/vue/outline'

const configs = ref<any>({})
const saving = ref(false)
const uploading = ref(false)

async function fetchConfigs() {
  try {
    const res = await superAdminApi.getServices()
    if (res.code === 0) {
      const list = res.data || []
      const obj: any = {}
      list.forEach((item: any) => {
        obj[item.key_name] = item.value
      })
      configs.value = obj
    }
  } catch (e) {
    console.error('获取配置失败', e)
  }
}

async function handleImageUpload(event: Event, type: 'alipay' | 'wechat') {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }
  
  uploading.value = true
  try {
    const base64 = await fileToBase64(file)
    const res = await superAdminApi.uploadQrcode(base64, type)
    if (res.code === 0) {
      if (type === 'alipay') {
        configs.value.alipay_qrcode = res.data.url
      } else {
        configs.value.wechat_qrcode = res.data.url
      }
      alert('上传成功！')
    } else {
      alert(res.message || '上传失败')
    }
  } catch (e) {
    console.error('上传失败', e)
    alert('上传失败，请重试')
  } finally {
    uploading.value = false
    if (target) target.value = ''
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function saveAll() {
  saving.value = true
  try {
    const keys = Object.keys(configs.value)
    for (const key of keys) {
      await superAdminApi.updateService(key, String(configs.value[key]))
    }
    alert('保存成功')
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfigs()
})
</script>
