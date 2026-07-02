<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">我的钱包</h1>
    </div>

    <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-6">
      <p class="text-white/80 text-sm">可提现余额</p>
      <p class="text-4xl font-bold mt-2">¥{{ formatMoney(balance) }}</p>
      <div class="flex gap-4 mt-4">
        <div>
          <p class="text-white/70 text-xs">累计收入</p>
          <p class="text-lg font-semibold">¥{{ formatMoney(totalIncome) }}</p>
        </div>
        <div>
          <p class="text-white/70 text-xs">累计提现</p>
          <p class="text-lg font-semibold">¥{{ formatMoney(totalWithdraw) }}</p>
        </div>
      </div>
      <button 
        @click="showWithdrawModal = true"
        :disabled="balance <= 0"
        class="mt-4 px-6 py-2 bg-white text-emerald-600 font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        立即提现
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="flex border-b border-gray-100">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['flex-1 py-4 text-center font-medium transition-all', activeTab === tab.key ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700']"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-4">
        <div v-if="activeTab === 'logs'" class="space-y-3">
          <div v-if="balanceLogs.length === 0" class="text-center py-12 text-gray-400">
            暂无余额明细
          </div>
          <div 
            v-for="log in balanceLogs" 
            :key="log.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', log.amount > 0 ? 'bg-green-100' : 'bg-red-100']">
                <span :class="['text-lg font-bold', log.amount > 0 ? 'text-green-600' : 'text-red-600']">
                  {{ log.amount > 0 ? '+' : '' }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ log.description }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(log.created_at) }}</p>
              </div>
            </div>
            <p :class="['font-semibold', log.amount > 0 ? 'text-green-600' : 'text-red-600']">
              {{ log.amount > 0 ? '+' : '' }}¥{{ formatMoney(log.amount) }}
            </p>
          </div>
        </div>

        <div v-if="activeTab === 'withdrawals'" class="space-y-3">
          <div v-if="withdrawals.length === 0" class="text-center py-12 text-gray-400">
            暂无提现记录
          </div>
          <div 
            v-for="w in withdrawals" 
            :key="w.id"
            class="p-4 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                  {{ w.withdraw_method === 'alipay' ? '支付宝' : '微信' }}
                </span>
                <span :class="['px-2 py-0.5 rounded text-xs', withdrawStatusClass(w.status)]">
                  {{ withdrawStatusLabels[w.status] }}
                </span>
              </div>
              <p class="text-lg font-bold text-gray-800">¥{{ formatMoney(w.amount) }}</p>
            </div>
            <div class="text-sm text-gray-500 space-y-1">
              <p v-if="w.withdraw_method === 'alipay'">支付宝账号：{{ w.alipay_account }}</p>
              <p v-if="w.withdraw_method === 'wechat'">微信账号：{{ w.wechat_account }}</p>
              <p>真实姓名：{{ w.real_name }}</p>
              <p>申请时间：{{ formatDate(w.created_at) }}</p>
              <p v-if="w.remark">备注：{{ w.remark }}</p>
              <p v-if="w.processed_at">处理时间：{{ formatDate(w.processed_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showWithdrawModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">申请提现</h3>
          <button @click="showWithdrawModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="p-4 bg-emerald-50 rounded-xl">
            <p class="text-sm text-gray-600">可提现余额</p>
            <p class="text-2xl font-bold text-emerald-600">¥{{ formatMoney(balance) }}</p>
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
                @click="withdrawForm.amount = formatMoney(balance)"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 text-sm hover:text-emerald-700"
              >
                全部提现
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">最低提现金额 ¥10.00</p>
          </div>

          <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>

          <button 
            @click="submitWithdraw"
            :disabled="submitting"
            class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? '提交中...' : '确认提现' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { XIcon } from '@heroicons/vue/outline'
import { agentApi } from '@/api'
import { formatMoney, formatTime } from '@/utils/format'

const balance = ref(0)
const totalIncome = ref(0)
const totalWithdraw = ref(0)
const balanceLogs = ref<any[]>([])
const withdrawals = ref<any[]>([])
const activeTab = ref('logs')
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
  { key: 'logs', label: '余额明细' },
  { key: 'withdrawals', label: '提现记录' }
]

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

function getAuthHeaders() {
  const token = localStorage.getItem('agent_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchProfile() {
  try {
    const res = await agentApi.getProfile()
    if (res.code === 0) {
      balance.value = res.data.balance || 0
      totalIncome.value = res.data.total_income || 0
    }
  } catch (e) {
    console.error('获取个人信息失败', e)
  }
}

async function fetchBalanceLogs() {
  try {
    const res = await agentApi.getBalanceLogs({ limit: 50 })
    if (res.code === 0) {
      balanceLogs.value = res.data.list || []
    }
  } catch (e) {
    console.error('获取余额明细失败', e)
  }
}

async function fetchWithdrawals() {
  try {
    const res = await agentApi.getWithdrawals({ limit: 50 })
    if (res.code === 0) {
      withdrawals.value = res.data.list || []
      totalWithdraw.value = withdrawals.value
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + w.amount, 0)
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
  if (amount < 10) {
    errorMsg.value = '最低提现金额为10元'
    return
  }
  if (amount > balance.value) {
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
    const res = await agentApi.withdraw(withdrawForm.value)
    if (res.code === 0) {
      alert('提现申请已提交，等待审核')
      showWithdrawModal.value = false
      withdrawForm.value = {
        amount: '',
        withdraw_method: 'alipay',
        alipay_account: '',
        wechat_account: '',
        real_name: ''
      }
      fetchProfile()
      fetchBalanceLogs()
      fetchWithdrawals()
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
  fetchProfile()
  fetchBalanceLogs()
  fetchWithdrawals()
})
</script>
