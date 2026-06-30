<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="$router.back()" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-bold text-gray-800">余额管理</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 余额卡片 -->
      <div class="card bg-gradient-to-br from-primary-600 to-primary-700 text-white mb-6">
        <p class="text-primary-100 mb-2">当前余额</p>
        <p class="text-4xl font-bold mb-4">¥{{ userStore.user?.balance?.toFixed(2) || '0.00' }}</p>
        <div class="flex gap-4">
          <button @click="activeTab = 'recharge'" class="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors">
            充值
          </button>
          <button @click="activeTab = 'withdraw'" class="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors">
            提现
          </button>
          <button @click="activeTab = 'records'" class="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors">
            明细
          </button>
        </div>
      </div>

      <!-- 充值 -->
      <div v-if="activeTab === 'recharge'" class="card">
        <h3 class="font-semibold text-gray-800 mb-4">充值金额</h3>
        <div class="grid grid-cols-3 gap-3 mb-4">
          <button 
            v-for="amount in [10, 20, 50, 100, 200, 500]"
            :key="amount"
            @click="rechargeAmount = amount"
            :class="['p-4 rounded-xl border-2 text-center transition-all font-medium', rechargeAmount === amount ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-gray-300']"
          >
            ¥{{ amount }}
          </button>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">自定义金额</label>
          <input v-model.number="rechargeAmount" type="number" min="1" class="input-field" placeholder="请输入充值金额" />
        </div>

        <h4 class="font-medium text-gray-800 mb-3">支付方式</h4>
        <div class="space-y-3 mb-6">
          <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
            <input v-model="rechargePayMethod" type="radio" value="alipay" class="w-5 h-5 text-primary-600" />
            <span class="font-medium">支付宝</span>
          </label>
          <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
            <input v-model="rechargePayMethod" type="radio" value="wechat" class="w-5 h-5 text-primary-600" />
            <span class="font-medium">微信支付</span>
          </label>
        </div>

        <button @click="handleRecharge" :disabled="!rechargeAmount || rechargeAmount <= 0" class="btn-primary w-full">
          立即充值 ¥{{ rechargeAmount || 0 }}
        </button>
      </div>

      <!-- 提现 -->
      <div v-if="activeTab === 'withdraw'" class="card">
        <h3 class="font-semibold text-gray-800 mb-4">提现到</h3>
        <div class="space-y-3 mb-6">
          <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
            <input v-model="withdrawType" type="radio" value="alipay" class="w-5 h-5 text-primary-600" />
            <span class="font-medium">支付宝</span>
          </label>
          <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
            <input v-model="withdrawType" type="radio" value="wechat" class="w-5 h-5 text-primary-600" />
            <span class="font-medium">微信</span>
          </label>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">提现账号</label>
          <input v-model="withdrawAccount" type="text" class="input-field" placeholder="请输入账号" />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">提现金额</label>
          <input v-model.number="withdrawAmount" type="number" :max="userStore.user?.balance" class="input-field" placeholder="请输入提现金额" />
          <p class="text-sm text-gray-500 mt-2">可提现余额: ¥{{ userStore.user?.balance?.toFixed(2) || '0.00' }}</p>
        </div>

        <p class="text-sm text-gray-500 mb-6">提现申请提交后，将在1-3个工作日内到账</p>

        <button @click="handleWithdraw" :disabled="!withdrawAmount || !withdrawAccount" class="btn-primary w-full">
          申请提现
        </button>
      </div>

      <!-- 交易明细 -->
      <div v-if="activeTab === 'records'" class="space-y-4">
        <div v-if="records.length === 0" class="card text-center py-8">
          <p class="text-gray-500">暂无交易记录</p>
        </div>
        <div v-else v-for="record in records" :key="record.id" class="card">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-gray-800">{{ typeLabels[record.type] }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ formatTime(record.created_at) }}</p>
              <p v-if="record.remark" class="text-sm text-gray-400 mt-1">{{ record.remark }}</p>
            </div>
            <p :class="['text-lg font-bold', record.amount > 0 ? 'text-green-600' : 'text-gray-800']">
              {{ record.amount > 0 ? '+' : '' }}{{ record.amount.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="message" :class="['fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg', message.type === 'success' ? 'bg-green-500' : 'bg-red-500', 'text-white']">
        {{ message.text }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { financeApi } from '@/api'
import { ChevronLeftIcon } from '@heroicons/vue/outline'
import type { Transaction } from '@/types'

const userStore = useUserStore()
const activeTab = ref('recharge')
const rechargeAmount = ref(10)
const rechargePayMethod = ref('alipay')
const withdrawAmount = ref(0)
const withdrawAccount = ref('')
const withdrawType = ref('alipay')
const records = ref<Transaction[]>([])
const message = ref<{ type: string; text: string } | null>(null)

const typeLabels: Record<string, string> = {
  recharge: '充值',
  withdraw: '提现',
  consume: '消费',
  refund: '退款'
}

function showMessage(type: string, text: string) {
  message.value = { type, text }
  setTimeout(() => { message.value = null }, 3000)
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

async function handleRecharge() {
  try {
    await financeApi.recharge(rechargeAmount.value, rechargePayMethod.value as 'alipay' | 'wechat')
    showMessage('success', '充值成功')
    userStore.fetchUserInfo()
    activeTab.value = 'records'
    fetchRecords()
  } catch (e: any) {
    showMessage('error', e.response?.data?.message || '充值失败')
  }
}

async function handleWithdraw() {
  if (withdrawAmount.value > (userStore.user?.balance || 0)) {
    showMessage('error', '余额不足')
    return
  }
  try {
    await financeApi.withdraw(withdrawAmount.value, withdrawAccount.value, withdrawType.value as 'alipay' | 'wechat')
    showMessage('success', '提现申请已提交')
    userStore.fetchUserInfo()
    withdrawAmount.value = 0
    withdrawAccount.value = ''
  } catch (e: any) {
    showMessage('error', e.response?.data?.message || '提现失败')
  }
}

async function fetchRecords() {
  try {
    const res = await financeApi.getRecords()
    if (res.code === 0) {
      records.value = res.data || []
    }
  } catch (e) {
    console.error('获取记录失败', e)
  }
}

onMounted(() => {
  userStore.fetchUserInfo()
  fetchRecords()
})
</script>
