<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">用户管理</h1>
    
    <!-- 用户列表 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">昵称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">余额</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-800">{{ user.id }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.phone }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.nickname || '-' }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">¥{{ user.balance.toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700']">
                  {{ user.role === 'admin' ? '管理员' : '用户' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', user.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ user.status === 1 ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ formatTime(user.created_at) }}</td>
              <td class="px-6 py-4 text-sm">
                <button 
                  @click="toggleStatus(user.id, user.status)"
                  :class="['text-sm', user.status === 1 ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700']"
                >
                  {{ user.status === 1 ? '禁用' : '启用' }}
                </button>
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
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'

const users = ref<any[]>([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit.value))

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

async function fetchUsers() {
  try {
    const res = await adminApi.getAllUsers({ page: page.value, limit: limit.value })
    if (res.code === 0) {
      users.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (e) {
    console.error('获取用户失败', e)
  }
}

async function toggleStatus(id: number, currentStatus: number) {
  const newStatus = currentStatus === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  if (!confirm(`确定要${action}该用户吗？`)) return
  
  try {
    await adminApi.updateUserStatus(id, newStatus)
    await fetchUsers()
  } catch (e) {
    console.error('更新用户状态失败', e)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
