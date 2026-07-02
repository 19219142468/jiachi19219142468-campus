<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">业务员提现审核</h1>
    </div>

    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-600 mb-1">审核状态</label>
          <select v-model="filterStatus" class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
            <option value="">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
        <button 
          @click="fetchWithdrawals"
          class="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
        >
          查询
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">申请时间</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">业务员</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">提现方式</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">账号</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">真实姓名</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">金额</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="withdrawals.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400">暂无提现申请</td>
            </tr>
            <tr v-for="w in withdrawals" :key="w.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatTime(w.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {{ w.agent_name?.charAt(0) || '业' }}
                  </div>
                  <span class="font-medium text-gray-800">{{ w.agent_name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {{ w.withdraw_method === 'alipay' ? '支付宝' : '微信' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ w.withdraw_method === 'alipay' ? w.alipay_account : w.wechat_account }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ w.real_name }}</td>
              <td class="px-6 py-4 font-semibold text-gray-800">¥{{ formatMoney(w.amount) }}</td>
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 rounded text-xs', statusClass(w.status)]">
                  {{ statusLabels[w.status] }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="w.status === 'pending'" class="flex gap-2">
                  <button 
                    @click="handleApprove(w)"
                    class="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                  >
                    通过
                  </button>
                  <button 
                    @click="handleReject(w)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    驳回
                  </button>
                </div>
                <div v-else>
                  <p v-if="w.remark" class="text-xs text-gray-500">备注：{{ w.remark }}</p>
                  <p v-if="w.processed_at" class="text-xs text-gray-400">{{ formatTime(w.processed_at) }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">驳回提现申请</h3>
          <button @click="showRejectModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">驳回原因</label>
            <textarea 
              v-model="rejectRemark"
              rows="3"
              placeholder="请输入驳回原因"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>
          <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>
          <div class="flex gap-3">
            <button 
              @click="showRejectModal = false"
              class="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              取消
            </button>
            <button 
              @click="confirmReject"
              :disabled="processing"
              class="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processing ? '处理中...' : '确认驳回' }}
            </button>
          </div>
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

const withdrawals = ref<any[]>([])
const filterStatus = ref('')
const showRejectModal = ref(false)
const currentWithdrawal = ref<any>(null)
const rejectRemark = ref('')
const processing = ref(false)
const errorMsg = ref('')

const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回'
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function getAuthHeaders() {
  const token = localStorage.getItem('super_admin_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchWithdrawals() {
  try {
    const params: any = { limit: 50 }
    if (filterStatus.value) params.status = filterStatus.value
    
    const res = await superAdminApi.getAgentWithdrawals(params)
    if (res.code === 0) {
      withdrawals.value = res.data.list || []
    }
  } catch (e) {
    console.error('获取提现记录失败', e)
  }
}

async function handleApprove(w: any) {
  if (!confirm('确认通过该提现申请？')) return
  
  try {
    const res = await superAdminApi.processAgentWithdrawal(w.id, 'approved')
    if (res.code === 0) {
      alert('已通过')
      fetchWithdrawals()
    } else {
      alert(res.message || '操作失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  }
}

function handleReject(w: any) {
  currentWithdrawal.value = w
  rejectRemark.value = ''
  errorMsg.value = ''
  showRejectModal.value = true
}

async function confirmReject() {
  if (!currentWithdrawal.value) return
  
  errorMsg.value = ''
  if (!rejectRemark.value.trim()) {
    errorMsg.value = '请输入驳回原因'
    return
  }

  processing.value = true
  try {
    const res = await superAdminApi.processAgentWithdrawal(
      currentWithdrawal.value.id, 
      'rejected', 
      rejectRemark.value
    )
    if (res.code === 0) {
      alert('已驳回')
      showRejectModal.value = false
      fetchWithdrawals()
    } else {
      errorMsg.value = res.message || '操作失败'
    }
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '操作失败'
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  filterStatus.value = 'pending'
  fetchWithdrawals()
})
</script>
