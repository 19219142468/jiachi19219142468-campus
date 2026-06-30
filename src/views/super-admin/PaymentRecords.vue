<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">支付流水</h1>
      <p class="text-gray-500">查看所有自动核验和手动确认的支付记录</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div class="flex flex-wrap gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">服务类型</label>
          <select v-model="filters.type" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="print">文件打印</option>
            <option value="course">课业时长整理</option>
            <option value="express">校内包裹配送</option>
            <option value="handwriting">文案代写</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">核验方式</label>
          <select v-model="filters.verify_type" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="auto">自动核验</option>
            <option value="manual">手动确认</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="fetchRecords" class="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
            查询
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm mb-1">总支付笔数</p>
        <p class="text-3xl font-bold text-gray-800">{{ total }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm mb-1">总支付金额</p>
        <p class="text-3xl font-bold text-green-600">¥{{ totalAmount.toFixed(2) }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm mb-1">自动核验</p>
        <p class="text-3xl font-bold text-blue-600">{{ autoCount }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <p class="text-gray-500 text-sm mb-1">手动确认</p>
        <p class="text-3xl font-bold text-orange-600">{{ manualCount }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="records.length === 0" class="p-12 text-center text-gray-400">
        <p>暂无支付记录</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务类型</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付方式</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">核验方式</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易号</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="record in records" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-mono text-sm text-gray-800">{{ record.order_no }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ record.type_label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm text-gray-800">{{ record.user_nickname || '用户' }}</p>
                  <p class="text-xs text-gray-500">{{ record.user_phone }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-lg font-bold text-green-600">¥{{ record.amount.toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                  record.pay_method === 'alipay' ? 'bg-blue-100 text-blue-800' : 
                  record.pay_method === 'wechat' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                  {{ record.pay_method === 'alipay' ? '支付宝' : record.pay_method === 'wechat' ? '微信' : '手动' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                  record.verify_type === 'auto' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800']">
                  {{ record.verify_type === 'auto' ? '自动核验' : '手动确认' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-mono text-xs text-gray-500">{{ record.trade_no || '-' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatTime(record.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { superAdminApi } from '@/api'

const records = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const filters = ref({
  type: '',
  verify_type: ''
})

const totalAmount = computed(() => {
  return records.value.reduce((sum, r) => sum + (r.amount || 0), 0)
})

const autoCount = computed(() => {
  return records.value.filter(r => r.verify_type === 'auto').length
})

const manualCount = computed(() => {
  return records.value.filter(r => r.verify_type === 'manual').length
})

async function fetchRecords() {
  loading.value = true
  try {
    const res = await superAdminApi.getPaymentRecords(filters.value)
    if (res.code === 0) {
      records.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    console.error('获取支付流水失败', e)
  } finally {
    loading.value = false
  }
}

function formatTime(time: string) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchRecords()
})
</script>
