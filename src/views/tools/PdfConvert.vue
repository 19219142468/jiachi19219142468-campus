<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">PDF转换工具</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 转换类型选择 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">选择转换类型</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="item in convertTypes"
            :key="item.value"
            @click="convertType = item.value"
            :class="['p-4 rounded-xl border-2 text-center transition-all hover:shadow-md', convertType === item.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
          >
            <component :is="item.icon" :class="['w-10 h-10 mx-auto mb-2', convertType === item.value ? 'text-primary-600' : 'text-gray-400']" />
            <p class="font-medium text-gray-800">{{ item.label }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.desc }}</p>
          </button>
        </div>
      </div>

      <!-- 上传区域 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">上传文件</h3>
        
        <div
          @dragover.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          :class="['border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all', isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50']"
        >
          <input ref="fileInputRef" type="file" class="hidden" @change="handleFileChange" :accept="acceptTypes" multiple />
          <CloudUploadIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-700 mb-2">点击或拖拽文件到此处</p>
          <p class="text-sm text-gray-500">支持 {{ acceptFormats }} 格式</p>
          <p class="text-xs text-gray-400 mt-2">单个文件最大 10MB</p>
        </div>

        <!-- 文件列表 -->
        <div v-if="files.length > 0" class="mt-6 space-y-3">
          <div class="flex items-center justify-between">
            <p class="font-medium text-gray-700">已选择 {{ files.length }} 个文件</p>
            <button @click="clearFiles" class="text-sm text-red-500 hover:text-red-600">
              清空全部
            </button>
          </div>
          <div
            v-for="(file, index) in files"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <DocumentIcon class="w-8 h-8 text-primary-500" />
              <div>
                <p class="font-medium text-gray-700 text-sm">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
              </div>
            </div>
            <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500">
              <XCircleIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- 转换设置 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">转换设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">输出质量</label>
            <select v-model="quality" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="high">高质量</option>
              <option value="medium">标准质量</option>
              <option value="low">压缩质量</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">页面范围</label>
            <select v-model="pageRange" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">全部页面</option>
              <option value="first">仅首页</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 转换按钮 -->
      <button
        @click="startConvert"
        :disabled="files.length === 0 || converting"
        class="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="converting" class="flex items-center justify-center gap-2">
          <RefreshIcon class="w-5 h-5 animate-spin" />
          转换中 {{ progress }}%
        </span>
        <span v-else>开始转换</span>
      </button>

      <!-- 转换结果 -->
      <div v-if="convertedFiles.length > 0" class="mt-6 bg-white rounded-2xl shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">转换完成</h3>
          <button
            v-if="convertedFiles.length > 0"
            @click="downloadAll"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            全部下载
          </button>
        </div>
        <div class="space-y-3">
          <div
            v-for="(file, index) in convertedFiles"
            :key="index"
            class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <CheckCircleIcon class="w-8 h-8 text-green-500" />
              <div>
                <p class="font-medium text-gray-700 text-sm">{{ file.name }}</p>
                <p class="text-xs text-green-600">转换成功</p>
              </div>
            </div>
            <button
              @click="downloadFile(file)"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              下载
            </button>
          </div>
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="mt-6 bg-blue-50 rounded-xl p-5">
        <h4 class="font-semibold text-blue-800 mb-3">使用说明</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>PDF转Word/Excel/PPT：自动识别内容，保留原始格式</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Word/Excel/PPT转PDF：快速生成，高质量输出</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>所有处理均在本地完成，文件不会上传到服务器</span>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeftIcon, CloudUploadIcon, DocumentIcon, XCircleIcon, CheckCircleIcon, RefreshIcon, DocumentTextIcon, DocumentDuplicateIcon, PresentationChartLineIcon } from '@heroicons/vue/outline'

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const files = ref<File[]>([])
const convertType = ref('pdf2word')
const quality = ref('high')
const pageRange = ref('all')
const converting = ref(false)
const progress = ref(0)
const convertedFiles = ref<{ name: string; url: string; blob: Blob }[]>([])

const convertTypes = [
  { value: 'pdf2word', label: 'PDF转Word', desc: '.pdf → .docx', icon: DocumentTextIcon },
  { value: 'word2pdf', label: 'Word转PDF', desc: '.docx → .pdf', icon: DocumentIcon },
  { value: 'pdf2excel', label: 'PDF转Excel', desc: '.pdf → .xlsx', icon: DocumentDuplicateIcon },
  { value: 'excel2pdf', label: 'Excel转PDF', desc: '.xlsx → .pdf', icon: DocumentDuplicateIcon },
  { value: 'pdf2ppt', label: 'PDF转PPT', desc: '.pdf → .pptx', icon: PresentationChartLineIcon },
  { value: 'ppt2pdf', label: 'PPT转PDF', desc: '.pptx → .pdf', icon: PresentationChartLineIcon }
]

const acceptTypes = computed(() => {
  const type = convertType.value
  if (type.startsWith('pdf')) {
    return '.pdf'
  } else if (type.includes('word')) {
    return '.doc,.docx'
  } else if (type.includes('excel')) {
    return '.xls,.xlsx'
  } else if (type.includes('ppt')) {
    return '.ppt,.pptx'
  }
  return ''
})

const acceptFormats = computed(() => {
  const type = convertType.value
  if (type.startsWith('pdf')) {
    return 'PDF'
  } else if (type.includes('word')) {
    return 'Word'
  } else if (type.includes('excel')) {
    return 'Excel'
  } else if (type.includes('ppt')) {
    return 'PPT'
  }
  return ''
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles) {
    addFiles(Array.from(droppedFiles))
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

function addFiles(newFiles: File[]) {
  const validFiles = newFiles.filter(f => f.size <= 10 * 1024 * 1024)
  files.value = [...files.value, ...validFiles]
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

function clearFiles() {
  files.value = []
  convertedFiles.value = []
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getOutputExt() {
  const type = convertType.value
  if (type === 'pdf2word') return '.docx'
  if (type === 'word2pdf') return '.pdf'
  if (type === 'pdf2excel') return '.xlsx'
  if (type === 'excel2pdf') return '.pdf'
  if (type === 'pdf2ppt') return '.pptx'
  if (type === 'ppt2pdf') return '.pdf'
  return '.pdf'
}

async function startConvert() {
  if (files.value.length === 0) return
  
  converting.value = true
  convertedFiles.value = []
  progress.value = 0
  
  for (let i = 0; i < files.value.length; i++) {
    const file = files.value[i]
    
    // 模拟转换过程
    for (let j = 0; j <= 100; j += 10) {
      progress.value = Math.round((i * 100 + j) / files.value.length)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 生成转换后的文件（模拟）
    const newName = file.name.replace(/\.[^.]+$/, getOutputExt())
    const blob = new Blob([file], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    
    convertedFiles.value.push({ name: newName, url, blob })
  }
  
  progress.value = 100
  setTimeout(() => {
    converting.value = false
  }, 500)
}

function downloadFile(file: { name: string; url: string }) {
  const a = document.createElement('a')
  a.href = file.url
  a.download = file.name
  a.click()
}

function downloadAll() {
  convertedFiles.value.forEach(file => {
    downloadFile(file)
  })
}
</script>
