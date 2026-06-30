<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">个人中心</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">个人信息</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {{ agent?.name?.charAt(0) || '业' }}
            </div>
            <div>
              <p class="text-xl font-bold text-gray-800">{{ agent?.name || '业务员' }}</p>
              <p class="text-gray-500">账号：{{ agent?.username }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500">累计接单</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ agent?.total_orders || 0 }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-sm text-gray-500">累计收入</p>
              <p class="text-2xl font-bold text-emerald-600 mt-1">¥{{ (agent?.total_income || 0).toFixed(2) }}</p>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-2">可接服务</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="svc in agent?.services || []" 
                :key="svc"
                :class="['px-3 py-1 rounded-full text-sm', serviceClass(svc)]"
              >
                {{ serviceLabels[svc] }}
              </span>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">手机号</p>
            <p class="text-gray-800">{{ agent?.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">账号状态</p>
            <span :class="['px-2 py-1 rounded-full text-xs', agent?.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700']">
              {{ agent?.status === 1 ? '正常' : '禁用' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">修改密码</h3>
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">原密码</label>
            <input 
              v-model="passwordForm.old_password"
              type="password" 
              placeholder="请输入原密码"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">新密码</label>
            <input 
              v-model="passwordForm.new_password"
              type="password" 
              placeholder="请输入新密码"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
            <input 
              v-model="passwordForm.confirm_password"
              type="password" 
              placeholder="请再次输入新密码"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>
          <button 
            type="submit" 
            :disabled="updating"
            class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ updating ? '修改中...' : '确认修改' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const agent = ref<any>(null)
const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})
const updating = ref(false)
const errorMsg = ref('')

const serviceLabels: Record<string, string> = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '写字服务'
}

function serviceClass(svc: string) {
  const classes: Record<string, string> = {
    print: 'bg-blue-100 text-blue-700',
    course: 'bg-green-100 text-green-700',
    express: 'bg-amber-100 text-amber-700',
    handwriting: 'bg-purple-100 text-purple-700'
  }
  return classes[svc] || 'bg-gray-100 text-gray-700'
}

function getAuthHeaders() {
  const token = localStorage.getItem('agent_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchProfile() {
  try {
    const res = await axios.get('/api/agent/profile', {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      agent.value = res.data.data
    }
  } catch (e) {
    console.error('获取个人信息失败', e)
  }
}

async function updatePassword() {
  errorMsg.value = ''
  
  if (!passwordForm.value.old_password) {
    errorMsg.value = '请输入原密码'
    return
  }
  if (!passwordForm.value.new_password) {
    errorMsg.value = '请输入新密码'
    return
  }
  if (passwordForm.value.new_password.length < 6) {
    errorMsg.value = '新密码至少6位'
    return
  }
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    errorMsg.value = '两次输入的新密码不一致'
    return
  }

  updating.value = true
  try {
    const res = await axios.put('/api/agent/password', {
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password
    }, {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
      alert('密码修改成功')
    } else {
      errorMsg.value = res.data.message || '修改失败'
    }
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '修改失败'
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
