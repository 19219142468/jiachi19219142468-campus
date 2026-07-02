<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">对账汇总</h1>

    <!-- 日期筛选 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-600 mb-1">开始日期</label>
          <input v-model="startDate" type="date" class="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">结束日期</label>
          <input v-model="endDate" type="date" class="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button @click="fetchData" class="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
          查询
        </button>
        <button @click="resetDates" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
          重置
        </button>
      </div>
    </div>

    <!-- 汇总卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
        <p class="text-sm text-blue-100">有效订单总数</p>
        <p class="text-3xl font-bold mt-1">{{ summary.total_orders }}</p>
      </div>
      <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white">
        <p class="text-sm text-green-100">订单总金额</p>
        <p class="text-3xl font-bold mt-1">¥{{ formatMoney(summary.total_amount) }}</p>
      </div>
      <div class="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-5 text-white">
        <p class="text-sm text-orange-100">平台抽成收入</p>
        <p class="text-3xl font-bold mt-1">¥{{ formatMoney(summary.platform_income) }}</p>
      </div>
    </div>

    <!-- 每日明细 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-800">每日明细</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">总订单数</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">总金额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">已完成</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">已完成金额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">待处理</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">待处理金额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">分类明细</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="day in dailyList" :key="day.date" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-800">{{ day.date }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ day.total_orders }}</td>
              <td class="px-6 py-4 text-sm font-bold text-green-600">¥{{ formatMoney(day.total_amount) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ day.completed_orders }}</td>
              <td class="px-6 py-4 text-sm text-green-600">¥{{ formatMoney(day.completed_amount) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ day.paid_orders }}</td>
              <td class="px-6 py-4 text-sm text-orange-600">¥{{ formatMoney(day.paid_amount) }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div v-for="(val, key) in day.by_type" :key="key" class="flex items-center gap-1">
                  <span :class="['px-1.5 py-0.5 rounded text-xs', typeColors[key]]">{{ typeNames[key] }}</span>
                  <span>{{ val.count }}单 ¥{{ formatMoney(val.amount) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="dailyList.length === 0" class="text-center py-12 text-gray-400">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { superAdminApi } from '@/api'
import { formatMoney } from '@/utils/format'

const startDate = ref('')
const endDate = ref('')
const dailyList = ref<any[]>([])
const summary = ref({
  total_orders: 0,
  total_amount: 0,
  platform_income: 0
})

const typeNames: Record<string, string> = {
  print: '打印',
  course: '课业',
  express: '快递',
  handwriting: '写字'
}

const typeColors: Record<string, string> = {
  print: 'bg-blue-100 text-blue-700',
  course: 'bg-green-100 text-green-700',
  express: 'bg-purple-100 text-purple-700',
  handwriting: 'bg-orange-100 text-orange-700'
}

async function fetchData() {
  try {
    const params: any = {}
    if (startDate.value) params.start_date = startDate.value
    if (endDate.value) params.end_date = endDate.value
    const res = await superAdminApi.getDailySummary(params)
    if (res.code === 0) {
      dailyList.value = res.data.daily || []
      summary.value = res.data.summary || { total_orders: 0, total_amount: 0, platform_income: 0 }
    }
  } catch (e) {
    console.error('获取对账数据失败', e)
  }
}

function resetDates() {
  startDate.value = ''
  endDate.value = ''
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
