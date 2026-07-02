<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <h1 class="text-2xl font-bold text-gray-800">用户评价</h1>
      <div class="flex items-center gap-3">
        <!-- 评分筛选 -->
        <div class="flex gap-2">
          <button
            v-for="opt in ratingFilters"
            :key="opt.value"
            @click="changeRating(opt.value)"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              ratingFilter === opt.value
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 评价统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-sm text-gray-500 mb-1">评价总数</p>
        <p class="text-2xl font-bold text-gray-800">{{ totalCount }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-sm text-gray-500 mb-1">平均评分</p>
        <p class="text-2xl font-bold text-orange-500">{{ avgRating }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-sm text-gray-500 mb-1">好评率（4-5星）</p>
        <p class="text-2xl font-bold text-green-500">{{ goodRate }}%</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-sm text-gray-500 mb-1">差评数（1-2星）</p>
        <p class="text-2xl font-bold text-red-500">{{ badCount }}</p>
      </div>
    </div>

    <!-- 评价列表 -->
    <div class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div :class="['w-11 h-11 rounded-xl flex items-center justify-center', typeBg(review.order_type)]">
              <component :is="typeIcon(review.order_type)" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ typeLabel(review.order_type) }}</p>
              <p class="text-xs text-gray-400">{{ review.order_no }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <span
              v-for="n in 5"
              :key="n"
              :class="n <= review.rating ? 'text-yellow-400' : 'text-gray-200'"
              class="text-lg"
            >★</span>
          </div>
        </div>

        <div v-if="review.content" class="bg-gray-50 rounded-xl p-3 mb-3">
          <p class="text-sm text-gray-700 leading-relaxed">{{ review.content }}</p>
        </div>
        <div v-else class="bg-gray-50 rounded-xl p-3 mb-3">
          <p class="text-sm text-gray-400 italic">用户未填写文字评价</p>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
          <span>用户：{{ maskPhone(review.user_phone) }}</span>
          <span>{{ formatDateTime(review.created_at) }}</span>
        </div>
      </div>

      <div v-if="reviews.length === 0" class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <StarIcon class="w-10 h-10 text-gray-300" />
        </div>
        <p class="text-gray-500">暂无用户评价</p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="mt-6 flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
      <p class="text-sm text-gray-500">共 {{ total }} 条评价</p>
      <div class="flex gap-2">
        <button
          @click="changePage(-1)"
          :disabled="page === 1"
          class="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
        >上一页</button>
        <span class="px-3 py-1 text-gray-600">{{ page }}/{{ Math.ceil(total / pageSize) }}</span>
        <button
          @click="changePage(1)"
          :disabled="page * pageSize >= total"
          class="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
        >下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { superAdminApi } from '@/api'
import {
  StarIcon,
  PrinterIcon,
  AcademicCapIcon,
  TruckIcon,
  PencilIcon
} from '@heroicons/vue/outline'

const reviews = ref<any[]>([])
const total = ref(0)
const totalCount = ref(0)
const avgRating = ref('0.0')
const goodRate = ref(0)
const badCount = ref(0)
const page = ref(1)
const pageSize = 10
const ratingFilter = ref('')

const ratingFilters = [
  { value: '', label: '全部' },
  { value: '5', label: '5星' },
  { value: '4', label: '4星' },
  { value: '3', label: '3星' },
  { value: '2', label: '2星' },
  { value: '1', label: '1星' }
]

const typeLabels: Record<string, string> = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '文案代写'
}

const typeBgs: Record<string, string> = {
  print: 'bg-blue-500',
  course: 'bg-purple-500',
  express: 'bg-orange-500',
  handwriting: 'bg-pink-500'
}

function typeLabel(t: string) {
  return typeLabels[t] || t
}

function typeBg(t: string) {
  return typeBgs[t] || 'bg-gray-500'
}

function typeIcon(t: string) {
  const map: Record<string, any> = {
    print: PrinterIcon,
    course: AcademicCapIcon,
    express: TruckIcon,
    handwriting: PencilIcon
  }
  return map[t] || StarIcon
}

function maskPhone(phone: string) {
  if (!phone || phone.length !== 11) return phone || '匿名用户'
  return phone.slice(0, 3) + '****' + phone.slice(7)
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchReviews() {
  try {
    const res = await superAdminApi.getReviews({
      page: page.value,
      limit: pageSize,
      rating: ratingFilter.value
    })
    if (res.code === 0) {
      reviews.value = res.data.list || []
      total.value = res.data.total || 0
      totalCount.value = (res.data.totalCount ?? res.data.total) || 0
      avgRating.value = res.data.avgRating || '0.0'
      goodRate.value = res.data.goodRate || 0
      badCount.value = res.data.badCount || 0
    }
  } catch (e) {
    console.error('获取评价失败', e)
  }
}

function changePage(delta: number) {
  page.value += delta
  fetchReviews()
}

function changeRating(v: string) {
  ratingFilter.value = v
  page.value = 1
  fetchReviews()
}

onMounted(() => fetchReviews())
</script>
