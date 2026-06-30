<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="$router.back()" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-bold text-gray-800">收货地址</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 地址列表 -->
      <div v-if="addresses.length > 0" class="space-y-4">
        <div 
          v-for="addr in addresses"
          :key="addr.id"
          class="card"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-800">{{ addr.name }}</span>
                <span class="text-gray-500">{{ addr.phone }}</span>
                <span v-if="addr.is_default" class="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded">默认</span>
              </div>
              <p class="text-gray-500 mt-1">{{ addr.location }} {{ addr.detail }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="editAddress(addr)" class="text-gray-500 hover:text-primary-600">
                <PencilIcon class="w-5 h-5" />
              </button>
              <button @click="deleteAddress(addr.id)" class="text-gray-500 hover:text-red-500">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <LocationMarkerIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">暂无收货地址</p>
      </div>

      <!-- 添加地址按钮 -->
      <button @click="showForm = true" class="fixed bottom-20 md:bottom-6 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
        <PlusIcon class="w-6 h-6" />
      </button>
    </main>

    <!-- 地址表单弹窗 -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div class="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800">{{ editingId ? '编辑地址' : '新增地址' }}</h3>
          <button @click="closeForm" class="text-gray-500 hover:text-gray-700">
            <XCircleIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">收货人</label>
            <input v-model="form.name" type="text" placeholder="请输入收货人姓名" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input v-model="form.phone" type="tel" maxlength="11" placeholder="请输入手机号" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">所在校区</label>
            <select v-model="form.location" class="input-field" required>
              <option value="">请选择校区</option>
              <option value="南门菜鸟驿站">南门菜鸟驿站</option>
              <option value="图书馆一楼打印店">图书馆一楼打印店</option>
              <option value="学生服务中心">学生服务中心</option>
              <option value="东苑宿舍区">东苑宿舍区</option>
              <option value="西苑宿舍区">西苑宿舍区</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
            <input v-model="form.detail" type="text" placeholder="如：3号楼301室" class="input-field" />
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_default" type="checkbox" class="w-4 h-4 text-primary-600 rounded" />
            <span class="text-sm text-gray-700">设为默认地址</span>
          </label>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="closeForm" class="btn-secondary flex-1">取消</button>
            <button type="submit" :disabled="submitting" class="btn-primary flex-1">
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '@/api'
import type { Address } from '@/types'
import { ChevronLeftIcon, LocationMarkerIcon, PlusIcon, PencilIcon, TrashIcon, XCircleIcon } from '@heroicons/vue/outline'

const addresses = ref<Address[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)

const form = ref({
  name: '',
  phone: '',
  location: '',
  detail: '',
  is_default: false
})

async function fetchAddresses() {
  try {
    const res = await userApi.getAddresses()
    if (res.code === 0) {
      addresses.value = res.data || []
    }
  } catch (e) {
    console.error('获取地址失败', e)
  }
}

function editAddress(addr: Address) {
  editingId.value = addr.id
  form.value = {
    name: addr.name,
    phone: addr.phone,
    location: addr.location,
    detail: addr.detail || '',
    is_default: addr.is_default === 1
  }
  showForm.value = true
}

async function deleteAddress(id: number) {
  if (!confirm('确定要删除该地址吗？')) return
  try {
    await userApi.deleteAddress(id)
    addresses.value = addresses.value.filter(a => a.id !== id)
  } catch (e) {
    console.error('删除地址失败', e)
  }
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  form.value = { name: '', phone: '', location: '', detail: '', is_default: false }
}

async function handleSubmit() {
  submitting.value = true
  try {
    const data = {
      name: form.value.name,
      phone: form.value.phone,
      location: form.value.location,
      detail: form.value.detail,
      is_default: form.value.is_default
    }
    
    if (editingId.value) {
      await userApi.updateAddress(editingId.value, data)
    } else {
      await userApi.addAddress(data)
    }
    
    await fetchAddresses()
    closeForm()
  } catch (e) {
    console.error('保存地址失败', e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>
