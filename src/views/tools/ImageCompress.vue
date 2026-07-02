<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-green-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">图片压缩</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 上传区域 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">上传图片</h3>
        <div
          @dragover.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          class="border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50 rounded-xl p-8 text-center cursor-pointer transition-all"
        >
          <input ref="fileInputRef" type="file" class="hidden" accept="image/*" multiple @change="handleFileChange" />
          <PhotographIcon class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p class="text-base font-medium text-gray-700 mb-1">点击或拖拽图片到此处</p>
          <p class="text-sm text-gray-500">支持 JPG、PNG、WebP 格式</p>
          <p class="text-xs text-gray-400 mt-2">可批量上传，单张最大10MB</p>
        </div>
      </div>

      <!-- 压缩设置 -->
      <div v-if="files.length > 0" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">压缩设置</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">压缩质量</span>
              <span class="font-medium text-green-600">{{ quality }}%</span>
            </div>
            <input v-model.number="quality" type="range" min="10" max="100" step="5" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500" />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>最小体积</span>
              <span>最佳质量</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">最大宽度（可选）</label>
            <input v-model="maxWidth" type="number" placeholder="不限制则留空" class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="files.length > 0" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">文件列表</h3>
          <div class="flex gap-2">
            <button @click="compressAll" :disabled="compressing" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50">
              {{ compressing ? '压缩中...' : '开始压缩' }}
            </button>
            <button @click="clearFiles" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">清空</button>
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="(file, index) in fileItems" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <DocumentIcon class="w-8 h-8 text-green-500 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-700 text-sm truncate">{{ file.name }}</p>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-gray-500">原始: {{ formatSize(file.originalSize) }}</span>
                  <span v-if="file.compressedSize" class="text-green-600">→ 压缩后: {{ formatSize(file.compressedSize) }}</span>
                  <span v-if="file.compressedSize" class="text-green-600 font-medium">省{{ Math.round((1 - file.compressedSize / file.originalSize) * 100) }}%</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span v-if="file.status === 'pending'" class="text-xs text-gray-400">待压缩</span>
              <span v-else-if="file.status === 'processing'" class="text-xs text-orange-500">压缩中...</span>
              <span v-else-if="file.status === 'done'" class="text-xs text-green-500">完成</span>
              <button v-if="file.status === 'done'" @click="downloadOne(index)" class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">下载</button>
              <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500">
                <XCircleIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量下载 -->
      <button v-if="fileItems.some(f => f.status === 'done')" @click="downloadAll" class="w-full py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors mb-6">
        全部下载
      </button>

      <!-- 说明 -->
      <div class="bg-blue-50 rounded-xl p-5">
        <h4 class="font-semibold text-blue-800 mb-3">使用说明</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span>所有处理在浏览器本地完成，不会上传服务器</span></li>
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span>质量越低文件越小，建议60%-80%平衡质量和体积</span></li>
          <li class="flex items-start gap-2"><CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" /><span>设置最大宽度可缩小图片尺寸，进一步减少体积</span></li>
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
const quality = ref(70)
const maxWidth = ref('')
const compressing = ref(false)

interface FileItem {
  file: File
  name: string
  originalSize: number
  compressedSize: number
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
  newFiles.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024).forEach(f => {
    fileItems.push({
      file: f,
      name: f.name,
      originalSize: f.size,
      compressedSize: 0,
      status: 'pending'
    })
  })
}

function removeFile(index: number) {
  fileItems.splice(index, 1)
}

function clearFiles() {
  fileItems.splice(0, fileItems.length)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function compressOne(item: FileItem) {
  item.status = 'processing'
  try {
    const img = await loadImage(item.file)
    let w = img.width
    let h = img.height
    const maxW = parseInt(maxWidth.value)
    if (maxW && w > maxW) {
      h = (h * maxW) / w
      w = maxW
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, w, h)
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality.value / 100)
    })
    item.blob = blob
    item.url = URL.createObjectURL(blob)
    item.compressedSize = blob.size
    item.status = 'done'
  } catch {
    item.status = 'pending'
  }
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

async function compressAll() {
  compressing.value = true
  for (const item of fileItems) {
    if (item.status === 'pending') {
      await compressOne(item)
    }
  }
  compressing.value = false
}

function downloadOne(index: number) {
  const item = fileItems[index]
  if (!item.url) return
  const a = document.createElement('a')
  a.href = item.url
  a.download = item.name.replace(/\.[^.]+$/, '') + '_compressed.jpg'
  a.click()
}

function downloadAll() {
  fileItems.forEach((_, i) => {
    if (fileItems[i].status === 'done') downloadOne(i)
  })
}
</script>
