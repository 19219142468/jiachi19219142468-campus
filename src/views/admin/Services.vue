<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">服务设置</h1>
    
    <div class="space-y-6">
      <!-- 打印价格设置 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">打印价格设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">黑白打印 (元/张)</label>
            <input v-model.number="config.blackPrintPrice" type="number" step="0.01" min="0" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">彩色打印 (元/张)</label>
            <input v-model.number="config.colorPrintPrice" type="number" step="0.01" min="0" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">订书钉装订 (元/份)</label>
            <input v-model.number="config.stapleBindingPrice" type="number" step="0.1" min="0" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">胶圈装订 (元/份)</label>
            <input v-model.number="config.spiralBindingPrice" type="number" step="0.1" min="0" class="input-field" />
          </div>
        </div>
        <button @click="saveConfig('print')" class="btn-primary mt-6">保存打印设置</button>
      </div>

      <!-- 课业时长整理服务价格设置 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">课业时长整理服务设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">基础代刷费用 (元/门)</label>
            <input v-model.number="config.courseBasePrice" type="number" step="0.1" min="0" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">加急费用 (元/门)</label>
            <input v-model.number="config.courseUrgentPrice" type="number" step="0.1" min="0" class="input-field" />
          </div>
        </div>
        <button @click="saveConfig('course')" class="btn-primary mt-6">保存课业时长整理服务设置</button>
      </div>

      <!-- 支付设置 -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">支付方式设置</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">支付模式</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="config.paymentMode" type="radio" value="direct" class="w-4 h-4 text-primary-600" />
                <span>直接到账模式</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="config.paymentMode" type="radio" value="platform" class="w-4 h-4 text-primary-600" />
                <span>平台余额模式</span>
              </label>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              {{ config.paymentMode === 'direct' ? '用户支付后资金直接进入您的个人账户' : '用户支付后资金进入平台账户，您可申请提现' }}
            </p>
          </div>
        </div>
        <button @click="saveConfig('payment')" class="btn-primary mt-6">保存支付设置</button>
      </div>
    </div>

    <div v-if="message" :class="['fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white', message.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'

const config = ref({
  blackPrintPrice: 0.2,
  colorPrintPrice: 0.3,
  stapleBindingPrice: 0.5,
  spiralBindingPrice: 2,
  courseBasePrice: 2,
  courseUrgentPrice: 3,
  paymentMode: 'platform'
})

const message = ref<{ type: string; text: string } | null>(null)

function showMsg(type: string, text: string) {
  message.value = { type, text }
  setTimeout(() => { message.value = null }, 3000)
}

async function saveConfig(type: string) {
  try {
    // 简化处理，实际应该分类型保存
    await adminApi.updateServiceConfig(type, JSON.stringify(config.value))
    showMsg('success', '保存成功')
  } catch (e) {
    showMsg('error', '保存失败')
  }
}

onMounted(async () => {
  try {
    const res = await adminApi.getServiceConfig()
    if (res.code === 0 && res.data) {
      // 加载配置
    }
  } catch (e) {
    console.error('获取配置失败', e)
  }
})
</script>
