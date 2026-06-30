<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">用户管理</h1>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">昵称</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">余额</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {{ user.nickname?.charAt(0) || user.phone?.charAt(0) || '用' }}
                  </div>
                  <span class="font-medium text-gray-800">{{ user.nickname || '未设置' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.phone }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.nickname || '-' }}</td>
              <td class="px-6 py-4 text-sm font-medium text-green-600">¥{{ (user.balance || 0).toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', user.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700']">
                  {{ roleLabels[user.role] || user.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', user.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700']">
                  {{ user.status === 1 ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(user.created_at) }}</td>
              <td class="px-6 py-4 text-sm">
                <button 
                  @click="toggleStatus(user)" 
                  :class="user.status === 1 ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'"
                >
                  {{ user.status === 1 ? '禁用' : '启用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="users.length === 0" class="text-center py-12 text-gray-400">
          暂无用户
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <span class="text-sm text-gray-500">共 {{ total }} 条</span>
        <div class="flex gap-2">
          <button 
            @click="page > 1 && (page--, fetchUsers())" 
            :disabled="page <= 1"
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="px-4 py-2 text-sm text-gray-600">{{ page }}</span>
          <button 
            @click="page * pageSize < total && (page++, fetchUsers())" 
            :disabled="page * pageSize >= total"
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const roleLabels: Record<string, string> = {
  user: '学生',
  admin: '管理员',
  super_admin: '超级管理员'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

function getAuthHeaders() {
  const token = localStorage.getItem('super_admin_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchUsers() {
  try {
    const res = await axios.get('/api/admin/users', {
      headers: getAuthHeaders(),
      params: { page: page.value, limit: pageSize.value }
    })
    if (res.data.code === 0) {
      users.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    }
  } catch (e) {
    console.error('获取用户列表失败', e)
  }
}

async function toggleStatus(user: any) {
  const newStatus = user.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  if (!confirm(`确定要${action}该用户吗？`)) return

  try {
    const res = await axios.put(
      `/api/admin/users/${user.id}/status`,
      { status: newStatus },
      { headers: getAuthHeaders() }
    )
    if (res.data.code === 0) {
      fetchUsers()
      alert(`${action}成功`)
    } else {
      alert(res.data.message || '操作失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
