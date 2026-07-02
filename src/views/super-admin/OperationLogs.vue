<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">操作日志</h1>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">操作人</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">详情</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{{ formatDateTime(log.created_at) }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">{{ log.operator_name }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="roleColors[log.operator_role] || 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded text-xs">{{ roleNames[log.operator_role] || log.operator_role }}</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="actionColors[log.action] || 'bg-gray-100 text-gray-700'" class="px-2 py-1 rounded text-xs">{{ actionNames[log.action] || log.action }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ log.detail }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="logs.length === 0" class="text-center py-12 text-gray-400">暂无操作记录</div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="px-6 py-4 flex items-center justify-between border-t border-gray-100">
        <p class="text-sm text-gray-500">共 {{ total }} 条记录</p>
        <div class="flex gap-2">
          <button @click="changePage(-1)" :disabled="page === 1" class="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50">上一页</button>
          <span class="px-3 py-1">{{ page }}/{{ Math.ceil(total / pageSize) }}</span>
          <button @click="changePage(1)" :disabled="page * pageSize >= total" class="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { superAdminApi } from '@/api'

const logs = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20

const roleNames: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  agent: '业务员',
  user: '用户'
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-blue-100 text-blue-700',
  agent: 'bg-green-100 text-green-700',
  user: 'bg-gray-100 text-gray-700'
}

const actionNames: Record<string, string> = {
  confirm_payment: '确认收款',
  assign: '分配订单',
  reclaim: '回收订单',
  complete: '完成订单',
  cancel: '取消订单',
  withdraw: '提现申请',
  withdraw_approve: '提现审核',
  login: '登录',
  update_price: '修改价格'
}

const actionColors: Record<string, string> = {
  confirm_payment: 'bg-green-100 text-green-700',
  assign: 'bg-blue-100 text-blue-700',
  reclaim: 'bg-orange-100 text-orange-700',
  complete: 'bg-green-100 text-green-700',
  cancel: 'bg-red-100 text-red-700',
  withdraw: 'bg-yellow-100 text-yellow-700',
  withdraw_approve: 'bg-purple-100 text-purple-700',
  login: 'bg-gray-100 text-gray-700',
  update_price: 'bg-cyan-100 text-cyan-700'
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

async function fetchLogs() {
  try {
    const res = await superAdminApi.getLogs({ page: page.value, limit: pageSize })
    if (res.code === 0) {
      logs.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    console.error('获取日志失败', e)
  }
}

function changePage(delta: number) {
  page.value += delta
  fetchLogs()
}

onMounted(() => fetchLogs())
</script>
