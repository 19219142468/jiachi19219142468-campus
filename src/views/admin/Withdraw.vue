<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">提现管理</h1>
    
    <!-- 提现列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">申请人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">方式</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">账号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">申请时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in withdrawals" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-600">{{ item.user?.phone || '未知' }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">¥{{ item.amount.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', item.account_type === 'alipay' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700']">
                  {{ item.account_type === 'alipay' ? '支付宝' : '微信' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ item.account }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', statusClass(item.status)]">
                  {{ statusLabels[item.status] }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(item.created_at) }}</td>
              <td class="px-6 py-4 text-sm">
                <div v-if="item.status === 'pending'" class="flex gap-2">
                  <button @click="approve(item.id)" class="text-green-600 hover:text-green-700">通过</button>
                  <button @click="reject(item.id)" class="text-red-600 hover:text-red-700">拒绝</button>
                </div>
                <span v-else-if="item.status === 'approved'" class="text-green-600">已转账</span>
                <span v-else class="text-gray-400">已拒绝</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <p class="text-sm text-gray-500">共 {{ total }} 条</p>
        <div class="flex gap-2">
          <button @click="page--" :disabled="page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">上一页</button>
          <span class="px-3 py-1">{{ page }} / {{ totalPages }}</span>
          <button @click="page++" :disabled="page >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { adminApi } from '@/api'

const withdrawals = ref<any[]>([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit.value))

const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝'
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

async function fetchWithdrawals() {
  try {
    const res = await adminApi.getWithdrawals({ page: page.value, limit: limit.value })
    if (res.code === 0) {
      withdrawals.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (e) {
    console.error('获取提现记录失败', e)
  }
}

async function approve(id: number) {
  if (!confirm('确定通过该提现申请？')) return
  try {
    await adminApi.updateWithdrawalStatus(id, 'approved')
    await fetchWithdrawals()
  } catch (e) {
    console.error('审核失败', e)
  }
}

async function reject(id: number) {
  if (!confirm('确定拒绝该提现申请？')) return
  try {
    await adminApi.updateWithdrawalStatus(id, 'rejected')
    await fetchWithdrawals()
  } catch (e) {
    console.error('审核失败', e)
  }
}

watch(page, () => {
  fetchWithdrawals()
})

onMounted(() => {
  fetchWithdrawals()
})
</script>
