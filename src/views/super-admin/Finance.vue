<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">资金财务</h1>
      <button 
        @click="showWithdrawModal = true"
        :disabled="!stats.platformBalance || stats.platformBalance <= 0"
        class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        平台提现
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <p class="text-white/80 text-sm">平台可提现余额</p>
        <p class="text-3xl font-bold mt-2">¥{{ formatMoney(stats.platformBalance) }}</p>
        <p class="text-white/70 text-xs mt-2">抽成比例：10%</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">今日平台收入</p>
        <p class="text-2xl font-bold text-green-600 mt-1">¥{{ formatMoney(stats.todayPlatformIncome) }}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">累计平台收入</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">¥{{ formatMoney(stats.totalPlatformIncome) }}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">累计总营收</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">¥{{ formatMoney(stats.totalRevenue) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">业务员佣金概览</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">累计发放佣金</span>
            <span class="font-semibold text-gray-800">¥{{ formatMoney(stats.totalAgentCommission) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">业务员待提现余额</span>
            <span class="font-semibold text-amber-600">¥{{ formatMoney(stats.totalAgentBalance) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">平台已提现</span>
            <span class="font-semibold text-red-600">¥{{ formatMoney(stats.totalPlatformWithdraw) }}</span>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">收入构成</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">平台抽成（10%）</span>
            <span class="font-semibold text-emerald-600">¥{{ formatMoney(stats.totalPlatformIncome) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">业务员佣金（90%）</span>
            <span class="font-semibold text-blue-600">¥{{ formatMoney(stats.totalAgentCommission) }}</span>
          </div>
          <div class="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span class="text-gray-700 font-medium">合计</span>
            <span class="font-bold text-gray-800">¥{{ formatMoney((stats.totalPlatformIncome || 0) + (stats.totalAgentCommission || 0)) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="flex border-b border-gray-100">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['flex-1 py-4 text-center font-medium transition-all', activeTab === tab.key ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700']"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="overflow-x-auto p-6">
        <div v-if="activeTab === 'income'">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">业务员</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单金额</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">平台抽成</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">说明</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="record in incomeRecords" :key="record.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatTime(record.created_at) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {{ orderTypeLabels[record.order_type] || record.order_type }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ record.agent_name || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-800">¥{{ formatMoney(record.total_amount) }}</td>
                <td class="px-4 py-3 text-sm font-medium text-green-600">+¥{{ formatMoney(record.amount) }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ record.description }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="incomeRecords.length === 0" class="text-center py-12 text-gray-400">
            暂无收入记录
          </div>
        </div>

        <div v-if="activeTab === 'withdraw'">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">提现方式</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">账号</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">真实姓名</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="w in withdrawRecords" :key="w.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatTime(w.created_at) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {{ w.withdraw_method === 'alipay' ? '支付宝' : '微信' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ w.withdraw_method === 'alipay' ? w.alipay_account : w.wechat_account }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ w.real_name }}</td>
                <td class="px-4 py-3 text-sm font-medium text-red-600">-¥{{ formatMoney(w.amount) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 rounded text-xs" :class="withdrawStatusClass(w.status)">
                    {{ withdrawStatusLabels[w.status] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="withdrawRecords.length === 0" class="text-center py-12 text-gray-400">
            暂无提现记录
          </div>
        </div>
      </div>
    </div>

    <div v-if="showWithdrawModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">平台提现</h3>
          <button @click="showWithdrawModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="p-4 bg-emerald-50 rounded-xl">
            <p class="text-sm text-gray-600">可提现余额</p>
            <p class="text-2xl font-bold text-emerald-600">¥{{ formatMoney(stats.platformBalance) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">提现方式</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="withdrawForm.withdraw_method = 'alipay'"
                :class="['p-4 border-2 rounded-xl text-center transition-all', withdrawForm.withdraw_method === 'alipay' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-2xl mb-1">💳</p>
                <p class="font-medium text-gray-800">支付宝</p>
              </button>
              <button 
                @click="withdrawForm.withdraw_method = 'wechat'"
                :class="['p-4 border-2 rounded-xl text-center transition-all', withdrawForm.withdraw_method === 'wechat' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <p class="text-2xl mb-1">💬</p>
                <p class="font-medium text-gray-800">微信</p>
              </button>
            </div>
          </div>

          <div v-if="withdrawForm.withdraw_method === 'alipay'">
            <label class="block text-sm font-medium text-gray-700 mb-2">支付宝账号</label>
            <input 
              v-model="withdrawForm.alipay_account"
              type="text" 
              placeholder="请输入支付宝账号"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div v-if="withdrawForm.withdraw_method === 'wechat'">
            <label class="block text-sm font-medium text-gray-700 mb-2">微信账号</label>
            <input 
              v-model="withdrawForm.wechat_account"
              type="text" 
              placeholder="请输入微信账号"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
            <input 
              v-model="withdrawForm.real_name"
              type="text" 
              placeholder="请输入真实姓名"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">提现金额</label>
            <div class="relative">
              <input 
                v-model="withdrawForm.amount"
                type="number" 
                placeholder="请输入提现金额"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button 
                type="button"
                @click="withdrawForm.amount = formatMoney(stats.platformBalance)"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 text-sm hover:text-emerald-700"
              >
                全部提现
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>

          <button 
            @click="submitWithdraw"
            :disabled="submitting"
            class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? '提交中...' : '确认提现' }}
          </button>
          <p class="text-xs text-gray-400 text-center">平台提现无需审核，提交后直接记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { XIcon } from '@heroicons/vue/outline'
import { superAdminApi } from '@/api'
import { formatMoney, formatTime } from '@/utils/format'

const stats = ref<any>({})
const incomeRecords = ref<any[]>([])
const withdrawRecords = ref<any[]>([])
const activeTab = ref('income')
const showWithdrawModal = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const withdrawForm = ref({
  amount: '',
  withdraw_method: 'alipay',
  alipay_account: '',
  wechat_account: '',
  real_name: ''
})

const tabs = [
  { key: 'income', label: '平台收入' },
  { key: 'withdraw', label: '平台提现记录' }
]

const orderTypeLabels: Record<string, string> = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '文案代写'
}

const withdrawStatusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回'
}

function withdrawStatusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

async function fetchFinanceStats() {
  try {
    const res = await superAdminApi.getFinanceStats()
    if (res.code === 0) {
      stats.value = res.data.stats || {}
      incomeRecords.value = res.data.recentRecords || []
    }
  } catch (e) {
    console.error('获取财务统计失败', e)
  }
}

async function fetchWithdrawRecords() {
  try {
    const res = await superAdminApi.getPlatformWithdrawals({ limit: 50 })
    if (res.code === 0) {
      withdrawRecords.value = res.data.list || []
    }
  } catch (e) {
    console.error('获取提现记录失败', e)
  }
}

async function submitWithdraw() {
  errorMsg.value = ''
  
  if (!withdrawForm.value.amount || parseFloat(withdrawForm.value.amount) <= 0) {
    errorMsg.value = '请输入提现金额'
    return
  }
  
  const amount = parseFloat(withdrawForm.value.amount)
  if (amount > (stats.value.platformBalance || 0)) {
    errorMsg.value = '余额不足'
    return
  }
  
  if (!withdrawForm.value.real_name) {
    errorMsg.value = '请输入真实姓名'
    return
  }
  
  if (withdrawForm.value.withdraw_method === 'alipay' && !withdrawForm.value.alipay_account) {
    errorMsg.value = '请输入支付宝账号'
    return
  }
  
  if (withdrawForm.value.withdraw_method === 'wechat' && !withdrawForm.value.wechat_account) {
    errorMsg.value = '请输入微信账号'
    return
  }

  submitting.value = true
  try {
    const res = await superAdminApi.platformWithdraw(withdrawForm.value)
    if (res.code === 0) {
      alert('提现成功')
      showWithdrawModal.value = false
      withdrawForm.value = {
        amount: '',
        withdraw_method: 'alipay',
        alipay_account: '',
        wechat_account: '',
        real_name: ''
      }
      fetchFinanceStats()
      fetchWithdrawRecords()
    } else {
      errorMsg.value = res.message || '提交失败'
    }
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '提交失败'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchFinanceStats()
  fetchWithdrawRecords()
})
</script>
