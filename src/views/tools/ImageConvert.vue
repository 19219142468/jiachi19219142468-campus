<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-cyan-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">图片格式转换</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 目标格式选择 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">转换为目标格式</h3>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="fmt in targetFormats"
            :key="fmt.value"
            @click="targetFormat = fmt.value"
            :class="['p-4 rounded-xl border-2 text-center transition-all', targetFormat === fmt.value ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300']"
          >
            <p class="font-bold text-gray-800">{{ fmt.label }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ fmt.desc }}</p>
          </button>
        </div>
      </div>

      <!-- 上传区域 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">上传图片</h3>
        <div
          @dragover.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          class="border-2 border-dashed border-gray-300 hover:border-cyan-400 hover:bg-gray-50 rounded-xl p-8 text-center cursor-pointer transition-all"
        >
          <input ref="fileInputRef" type="file" class="hidden" accept="image/*" multiple @change="handleFileChange" />
          <PhotographIcon class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p class="text-base font-medium text-gray-700 mb-1">点击或拖拽图片到此处</p>
          <p class="text-sm text-gray-500">支持 JPG、PNG、WebP 格式</p>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="fileItems.length > 0" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">文件列表</h3>
          <div class="flex gap-2">
            <button @click="convertAll" :disabled="converting" class="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm disabled:opacity-50">
              {{ converting ? '转换中...' : '开始转换' }}
            </button>
            <button @click="clearFiles" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">清空</button>
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="(item, index) in fileItems" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <DocumentIcon class="w-8 h-8 text-cyan-500 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-700 text-sm truncate">{{ item.name }}</p>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-gray-500">{{ formatSize(item.originalSize) }}</span>
                  <span v-if="item.status === 'done'" class="text-cyan-600">→ {{ item.newName }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span v-if="item.status === 'pending'" class="text-xs text-gray-400">待转换</span>
              <span v-else-if="item.status === 'processing'" class="text-xs text-orange-500">转换中...</span>
              <button v-if="item.status === 'done'" @click="downloadOne(index)" class="px-3 py-1 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600">下载</button>
              <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500">
                <XCircleIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量下载 -->
      <button v-if="fileItems.some(f => f.status === 'done')" @click="downloadAll" class="w-full py-3 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 transition-colors mb-6">
        全部下载
      </button>

      <!-- 说明 -->
      <div class="bg-blue-50 rounded-xl p-5">
        <h4 class="font-semibold text-blue-800 mb-3">格式说明</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span><strong>JPG</strong>：有损压缩，适合照片，文件最小</span></li>
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span><strong>PNG</strong>：无损压缩，支持透明背景</span></li>
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span><strong>WebP</strong>：现代格式，体积小质量好（部分老浏览器不支持查看）</span></li>
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span>所有处理在浏览器本地完成，不会上传服务器</span></li>
        </ul>
      </div>
    </main>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ChevronLeftIcon, PhotographIcon, DocumentIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/vue/outline'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

const fileInputRef = ref<HTMLInputElement | null>(null)
const targetFormat = ref('jpeg')
const converting = ref(false)

const targetFormats = [
  { value: 'jpeg', label: 'JPG', desc: '有损压缩' },
  { value: 'png', label: 'PNG', desc: '无损透明' },
  { value: 'webp', label: 'WebP', desc: '现代格式' }
]

interface FileItem {
  file: File
  name: string
  newName: string
  originalSize: number
  status: 'pending' | 'processing' | 'done'
  blob?: Blob
  url?: string
}

const fileItems = reactive<FileItem[]>([])

function triggerFileInput() { fileInputRef.value?.click() }

function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files) addFiles(Array.from(files))
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) addFiles(Array.from(target.files))
}

function addFiles(newFiles: File[]) {
  newFiles.filter(f => f.type.startsWith('image/')).forEach(f => {
    fileItems.push({
      file: f,
      name: f.name,
      newName: f.name.replace(/\.[^.]+$/, '') + '.' + targetFormat.value,
      originalSize: f.size,
      status: 'pending'
    })
  })
}

function removeFile(index: number) { fileItems.splice(index, 1) }
function clearFiles() { fileItems.splice(0, fileItems.length) }

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function convertOne(item: FileItem) {
  item.status = 'processing'
  try {
    const img = await loadImage(item.file)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    
    // PNG需要透明背景，其他格式填充白色
    if (targetFormat.value !== 'png') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0)
    
    const mimeType = targetFormat.value === 'jpeg' ? 'image/jpeg' : targetFormat.value === 'png' ? 'image/png' : 'image/webp'
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, 0.92)
    })
    item.blob = blob
    item.url = URL.createObjectURL(blob)
    item.newName = item.name.replace(/\.[^.]+$/, '') + '.' + (targetFormat.value === 'jpeg' ? 'jpg' : targetFormat.value)
    item.status = 'done'
  } catch {
    item.status = 'pending'
  }
}

async function convertAll() {
  converting.value = true
  for (const item of fileItems) {
    if (item.status === 'pending') await convertOne(item)
  }
  converting.value = false
}

function downloadOne(index: number) {
  const item = fileItems[index]
  if (!item.url) return
  const a = document.createElement('a')
  a.href = item.url
  a.download = item.newName
  a.click()
}

function downloadAll() {
  fileItems.forEach((_, i) => {
    if (fileItems[i].status === 'done') downloadOne(i)
  })
}
</script>
