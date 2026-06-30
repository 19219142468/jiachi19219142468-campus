<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">业务员管理</h1>
      <button 
        @click="showAddModal = true" 
        class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <PlusIcon class="w-5 h-5" />
        新增业务员
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">业务员总数</p>
        <p class="text-2xl font-bold text-gray-800 mt-1">{{ total }}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">已激活</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ activeCount }}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">总接单数</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ totalOrders }}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm">总流水</p>
        <p class="text-2xl font-bold text-amber-600 mt-1">¥{{ totalIncome.toFixed(2) }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">业务员</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">可接服务</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">接单数</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">流水</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="agent in agents" :key="agent.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {{ agent.name?.charAt(0) || '业' }}
                  </div>
                  <span class="font-medium text-gray-800">{{ agent.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ agent.username }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ agent.phone || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="svc in agent.services" 
                    :key="svc"
                    :class="['px-2 py-0.5 rounded text-xs', serviceClass(svc)]"
                  >
                    {{ serviceLabels[svc] }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-800">{{ agent.total_orders || 0 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-green-600">¥{{ (agent.total_income || 0).toFixed(2) }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="['px-2 py-1 rounded-full text-xs', agent.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700']">
                  {{ agent.status === 1 ? '正常' : '禁用' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <button @click="viewStats(agent)" class="text-indigo-600 hover:text-indigo-800 mr-3">
                  收入统计
                </button>
                <button @click="editAgent(agent)" class="text-indigo-600 hover:text-indigo-800 mr-3">
                  编辑
                </button>
                <button 
                  @click="toggleStatus(agent)" 
                  :class="agent.status === 1 ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'"
                  class="mr-3"
                >
                  {{ agent.status === 1 ? '禁用' : '启用' }}
                </button>
                <button 
                  @click="deleteAgent(agent.id)" 
                  class="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="agents.length === 0" class="text-center py-12 text-gray-400">
          暂无业务员
        </div>
      </div>
    </div>

    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">{{ showAddModal ? '新增业务员' : '编辑业务员' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">登录用户名</label>
            <input 
              v-model="formData.username"
              type="text" 
              placeholder="请输入登录用户名"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ showAddModal ? '登录密码' : '新密码（不填则不改）' }}</label>
            <input 
              v-model="formData.password"
              type="password" 
              placeholder="请输入密码"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input 
              v-model="formData.name"
              type="text" 
              placeholder="请输入业务员姓名"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input 
              v-model="formData.phone"
              type="tel" 
              placeholder="请输入手机号"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              maxlength="11"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">可接业务</label>
            <div class="grid grid-cols-2 gap-3">
              <label 
                v-for="svc in serviceOptions" 
                :key="svc.value"
                :class="[
                  'flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors',
                  formData.services.includes(svc.value) 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <input 
                  type="checkbox" 
                  :value="svc.value"
                  v-model="formData.services"
                  class="w-4 h-4 text-indigo-600 rounded"
                />
                <span class="text-sm text-gray-700">{{ svc.label }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex gap-3">
          <button 
            @click="closeModal" 
            class="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button 
            @click="saveAgent" 
            :disabled="saving"
            class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 收入统计详情弹窗 -->
    <div v-if="showStatsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            收入统计 - {{ statsData?.agent?.name || '业务员' }}
          </h3>
          <button @click="closeStatsModal" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <div v-if="statsLoading" class="text-center py-12">
            <RefreshIcon class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            <p class="text-gray-500 mt-2">加载中...</p>
          </div>
          <template v-else-if="statsData">
            <!-- 统计卡片 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <p class="text-gray-500 text-sm">今日收入</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">¥{{ statsData.todayIncome.toFixed(2) }}</p>
              </div>
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p class="text-gray-500 text-sm">本月收入</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">¥{{ statsData.monthIncome.toFixed(2) }}</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <p class="text-gray-500 text-sm">累计收入</p>
                <p class="text-2xl font-bold text-green-600 mt-1">¥{{ statsData.totalIncome.toFixed(2) }}</p>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p class="text-gray-500 text-sm">完成订单</p>
                <p class="text-2xl font-bold text-purple-600 mt-1">{{ statsData.completedOrders }}单</p>
              </div>
            </div>

            <!-- 服务类型分布 -->
            <div class="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h4 class="font-semibold text-gray-800 mb-4">服务类型分布（已完成）</h4>
              <div class="grid grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <PrinterIcon class="w-6 h-6 text-blue-600" />
                </div>
                <p class="text-lg font-bold text-gray-800">{{ statsData.typeStats.print }}</p>
                <p class="text-xs text-gray-500">文件打印</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon class="w-6 h-6 text-green-600" />
                </div>
                <p class="text-lg font-bold text-gray-800">{{ statsData.typeStats.course }}</p>
                <p class="text-xs text-gray-500">课业整理</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
                  <TruckIcon class="w-6 h-6 text-amber-600" />
                </div>
                <p class="text-lg font-bold text-gray-800">{{ statsData.typeStats.express }}</p>
                <p class="text-xs text-gray-500">包裹配送</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <PencilIcon class="w-6 h-6 text-purple-600" />
                </div>
                <p class="text-lg font-bold text-gray-800">{{ statsData.typeStats.handwriting }}</p>
                <p class="text-xs text-gray-500">写字服务</p>
              </div>
            </div>
            </div>

            <!-- 每日收入明细 -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h4 class="font-semibold text-gray-800 mb-4">近30天收入明细</h4>
              <div v-if="statsData.dailyStats.length === 0" class="text-center py-8 text-gray-400">
                暂无收入记录
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="item in statsData.dailyStats" :key="item.date" 
                  class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p class="font-medium text-gray-800">{{ item.date }}</p>
                    <p class="text-xs text-gray-500">{{ item.orders }}笔订单</p>
                  </div>
                  <p class="text-lg font-bold text-green-600">+¥{{ item.income.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="p-6 border-t border-gray-100">
          <button 
            @click="closeStatsModal" 
            class="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { 
  PlusIcon, 
  XIcon, 
  RefreshIcon, 
  PrinterIcon, 
  AcademicCapIcon, 
  TruckIcon, 
  PencilIcon 
} from '@heroicons/vue/outline'

const agents = ref<any[]>([])
const total = ref(0)
const showAddModal = ref(false)
const showEditModal = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const showStatsModal = ref(false)
const statsLoading = ref(false)
const statsData = ref<any>(null)

const formData = ref({
  username: '',
  password: '',
  name: '',
  phone: '',
  services: [] as string[]
})

const serviceOptions = [
  { value: 'print', label: '文件打印' },
  { value: 'course', label: '课业时长整理服务' },
  { value: 'express', label: '校内包裹配送服务' },
  { value: 'handwriting', label: '写字服务' }
]

const serviceLabels: Record<string, string> = {
  print: '打印',
  course: '网课',
  express: '快递',
  handwriting: '代写'
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

const activeCount = computed(() => agents.value.filter(a => a.status === 1).length)
const totalOrders = computed(() => agents.value.reduce((sum, a) => sum + (a.total_orders || 0), 0))
const totalIncome = computed(() => agents.value.reduce((sum, a) => sum + (a.total_income || 0), 0))

function getAuthHeaders() {
  const token = localStorage.getItem('super_admin_token')
  return { Authorization: `Bearer ${token}` }
}

async function fetchAgents() {
  try {
    const res = await axios.get('/api/super-admin/agents', {
      headers: getAuthHeaders(),
      params: { limit: 100 }
    })
    if (res.data.code === 0) {
      agents.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    }
  } catch (e) {
    console.error('获取业务员列表失败', e)
  }
}

function editAgent(agent: any) {
  editingId.value = agent.id
  formData.value = {
    username: agent.username,
    password: '',
    name: agent.name,
    phone: agent.phone,
    services: [...agent.services]
  }
  showEditModal.value = true
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingId.value = null
  formData.value = {
    username: '',
    password: '',
    name: '',
    phone: '',
    services: []
  }
}

async function saveAgent() {
  if (!formData.value.username) {
    alert('请输入用户名')
    return
  }
  if (showAddModal.value && !formData.value.password) {
    alert('请输入密码')
    return
  }

  saving.value = true
  try {
    let res
    if (showAddModal.value) {
      res = await axios.post('/api/super-admin/agents', formData.value, {
        headers: getAuthHeaders()
      })
    } else {
      const data: any = { ...formData.value }
      if (!data.password) delete data.password
      res = await axios.put(`/api/super-admin/agents/${editingId.value}`, data, {
        headers: getAuthHeaders()
      })
    }

    if (res.data.code === 0) {
      closeModal()
      fetchAgents()
      alert('保存成功')
    } else {
      alert(res.data.message || '保存失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(agent: any) {
  const newStatus = agent.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  if (!confirm(`确定要${action}该业务员吗？`)) return

  try {
    const res = await axios.put(
      `/api/super-admin/agents/${agent.id}`,
      { status: newStatus },
      { headers: getAuthHeaders() }
    )
    if (res.data.code === 0) {
      fetchAgents()
      alert(`${action}成功`)
    } else {
      alert(res.data.message || '操作失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  }
}

async function deleteAgent(id: number) {
  if (!confirm('确定要删除该业务员吗？此操作不可恢复。')) return

  try {
    const res = await axios.delete(`/api/super-admin/agents/${id}`, {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      fetchAgents()
      alert('删除成功')
    } else {
      alert(res.data.message || '删除失败')
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function viewStats(agent: any) {
  showStatsModal.value = true
  statsLoading.value = true
  statsData.value = null
  try {
    const res = await axios.get(`/api/super-admin/agents/${agent.id}/stats`, {
      headers: getAuthHeaders()
    })
    if (res.data.code === 0) {
      statsData.value = res.data.data
    }
  } catch (e) {
    console.error('获取收入统计失败', e)
  } finally {
    statsLoading.value = false
  }
}

function closeStatsModal() {
  showStatsModal.value = false
  statsData.value = null
}

onMounted(() => {
  fetchAgents()
})
</script>
