<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-orange-600 mr-4">
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
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="item in convertTypes"
            :key="item.value"
            @click="convertType = item.value"
            :class="['p-3 md:p-4 rounded-xl border-2 text-center transition-all hover:shadow-md', convertType === item.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300']"
          >
            <p class="font-medium text-gray-800 text-sm md:text-base">{{ item.label }}</p>
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
          :class="['border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all', isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50']"
        >
          <input ref="fileInputRef" type="file" class="hidden" @change="handleFileChange" :accept="acceptTypes" multiple />
          <CloudUploadIcon class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p class="text-base font-medium text-gray-700 mb-1">点击或拖拽文件到此处</p>
          <p class="text-sm text-gray-500">支持 {{ acceptFormats }} 格式</p>
          <p class="text-xs text-gray-400 mt-2">单个文件最大 10MB</p>
        </div>

        <!-- 文件列表 -->
        <div v-if="files.length > 0" class="mt-6 space-y-3">
          <div class="flex items-center justify-between">
            <p class="font-medium text-gray-700">已选择 {{ files.length }} 个文件</p>
            <button @click="clearFiles" class="text-sm text-red-500 hover:text-red-600">清空全部</button>
          </div>
          <div
            v-for="(file, index) in files"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3 min-w-0">
              <DocumentIcon class="w-8 h-8 text-orange-500 flex-shrink-0" />
              <div class="min-w-0">
                <p class="font-medium text-gray-700 text-sm truncate">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
              </div>
            </div>
            <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500 flex-shrink-0">
              <XCircleIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- 转换按钮 -->
      <button
        @click="startConvert"
        :disabled="files.length === 0 || converting"
        class="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div class="flex items-center gap-3 min-w-0">
              <CheckCircleIcon class="w-8 h-8 text-green-500 flex-shrink-0" />
              <div class="min-w-0">
                <p class="font-medium text-gray-700 text-sm truncate">{{ file.name }}</p>
                <p class="text-xs text-green-600">{{ formatSize(file.blob.size) }}</p>
              </div>
            </div>
            <button
              @click="downloadFile(file)"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex-shrink-0"
            >
              下载
            </button>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errors.length > 0" class="mt-4 bg-red-50 rounded-xl p-4">
        <h4 class="font-semibold text-red-800 mb-2">部分文件转换失败</h4>
        <ul class="space-y-1 text-sm text-red-600">
          <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <!-- 注意事项 -->
      <div class="mt-6 bg-blue-50 rounded-xl p-5">
        <h4 class="font-semibold text-blue-800 mb-3">使用说明</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>图片转PDF：支持JPG/PNG批量转成一个PDF文件</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Word/Text转PDF：提取文本内容生成PDF</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>所有处理均在浏览器本地完成，文件不会上传服务器</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>注意：复杂的Word/Excel格式转换建议使用专业软件</span>
          </li>
        </ul>
      </div>
    </main>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeftIcon, CloudUploadIcon, DocumentIcon, XCircleIcon, CheckCircleIcon, RefreshIcon } from '@heroicons/vue/outline'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { jsPDF } from 'jspdf'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const files = ref<File[]>([])
const convertType = ref('img2pdf')
const converting = ref(false)
const progress = ref(0)
const convertedFiles = ref<{ name: string; url: string; blob: Blob }[]>([])
const errors = ref<string[]>([])

const convertTypes = [
  { value: 'img2pdf', label: '图片转PDF', desc: 'JPG/PNG → PDF' },
  { value: 'pdf2img', label: 'PDF转图片', desc: 'PDF → JPG' },
  { value: 'txt2pdf', label: '文本转PDF', desc: 'TXT → PDF' },
  { value: 'pdf2txt', label: 'PDF转文本', desc: 'PDF → TXT' },
  { value: 'word2pdf', label: 'Word转PDF', desc: 'DOC/DOCX → PDF' },
  { value: 'mergepdf', label: '合并PDF', desc: '多个PDF → 一个' }
]

const acceptTypes = computed(() => {
  const type = convertType.value
  if (type === 'img2pdf') return 'image/jpeg,image/png,image/jpg'
  if (type === 'pdf2img' || type === 'mergepdf') return '.pdf'
  if (type === 'txt2pdf') return '.txt'
  if (type === 'pdf2txt') return '.pdf'
  if (type === 'word2pdf') return '.doc,.docx'
  return ''
})

const acceptFormats = computed(() => {
  const type = convertType.value
  if (type === 'img2pdf') return 'JPG、PNG'
  if (type === 'pdf2img' || type === 'mergepdf') return 'PDF'
  if (type === 'txt2pdf') return 'TXT'
  if (type === 'pdf2txt') return 'PDF'
  if (type === 'word2pdf') return 'Word'
  return ''
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles) addFiles(Array.from(droppedFiles))
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) addFiles(Array.from(target.files))
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
  errors.value = []
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function startConvert() {
  if (files.value.length === 0) return
  
  converting.value = true
  convertedFiles.value = []
  errors.value = []
  progress.value = 0
  
  const total = files.value.length
  
  if (convertType.value === 'img2pdf') {
    // 图片转PDF - 把所有图片合并到一个PDF
    try {
      const pdfDoc = await PDFDocument.create()
      for (let i = 0; i < files.value.length; i++) {
        try {
          const file = files.value[i]
          const arrayBuffer = await file.arrayBuffer()
          let img
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            img = await pdfDoc.embedJpg(arrayBuffer)
          } else if (file.type === 'image/png') {
            img = await pdfDoc.embedPng(arrayBuffer)
          } else {
            errors.value.push(`${file.name}: 不支持的图片格式`)
            continue
          }
          const page = pdfDoc.addPage([img.width, img.height])
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
          progress.value = Math.round(((i + 1) / total) * 100)
        } catch (e) {
          errors.value.push(`${files.value[i].name}: 转换失败`)
        }
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      convertedFiles.value.push({ name: '图片转换.pdf', url, blob })
    } catch (e: any) {
      errors.value.push('合并PDF失败: ' + e.message)
    }
  } else if (convertType.value === 'pdf2img') {
    // PDF转图片 - 用pdf.js渲染每页
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url)
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href
      
      for (let i = 0; i < files.value.length; i++) {
        try {
          const file = files.value[i]
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p)
            const viewport = page.getViewport({ scale: 2 })
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            canvas.width = viewport.width
            canvas.height = viewport.height
            await page.render({ canvasContext: ctx, viewport }).promise
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95)
            })
            const url = URL.createObjectURL(blob)
            const baseName = file.name.replace(/\.pdf$/i, '')
            convertedFiles.value.push({ name: `${baseName}_第${p}页.jpg`, url, blob })
          }
          progress.value = Math.round(((i + 1) / total) * 100)
        } catch (e) {
          errors.value.push(`${files.value[i].name}: 转换失败`)
        }
      }
    } catch (e: any) {
      errors.value.push('PDF转图片需要联网加载组件，请检查网络')
    }
  } else if (convertType.value === 'txt2pdf') {
    // 文本转PDF
    for (let i = 0; i < files.value.length; i++) {
      try {
        const file = files.value[i]
        const text = await file.text()
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
        const fontSize = 12
        const lineHeight = 20
        const margin = 50
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const maxLineWidth = pageWidth - margin * 2
        
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(text, maxLineWidth) as string[]
        
        let y = margin
        for (const line of lines) {
          if (y > pageHeight - margin) {
            pdf.addPage()
            y = margin
          }
          pdf.text(line, margin, y)
          y += lineHeight
        }
        
        const blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)
        const newName = file.name.replace(/\.txt$/i, '') + '.pdf'
        convertedFiles.value.push({ name: newName, url, blob })
        progress.value = Math.round(((i + 1) / total) * 100)
      } catch (e) {
        errors.value.push(`${files.value[i].name}: 转换失败`)
      }
    }
  } else if (convertType.value === 'pdf2txt') {
    // PDF转文本
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url)
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href
      
      for (let i = 0; i < files.value.length; i++) {
        try {
          const file = files.value[i]
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let fullText = ''
          let hasText = false
          
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p)
            const content = await page.getTextContent()
            const pageText = content.items.map((item: any) => item.str).join(' ').trim()
            if (pageText.length > 0) hasText = true
            fullText += `--- 第${p}页 ---\n${pageText}\n\n`
          }
          
          if (!hasText) {
            errors.value.push(`${file.name}: 该PDF是图片扫描件，无法直接提取文字，请使用"PDF转图片"功能后再用OCR识别`)
            progress.value = Math.round(((i + 1) / total) * 100)
            continue
          }
          
          const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const newName = file.name.replace(/\.pdf$/i, '') + '.txt'
          convertedFiles.value.push({ name: newName, url, blob })
          progress.value = Math.round(((i + 1) / total) * 100)
        } catch (e) {
          errors.value.push(`${files.value[i].name}: 转换失败`)
        }
      }
    } catch (e: any) {
      errors.value.push('PDF组件加载失败: ' + e.message)
    }
  } else if (convertType.value === 'word2pdf') {
    // Word转PDF - 提取文本内容生成PDF
    for (let i = 0; i < files.value.length; i++) {
      try {
        const file = files.value[i]
        const arrayBuffer = await file.arrayBuffer()
        let text = ''
        
        if (file.name.endsWith('.docx')) {
          // 简单的docx文本提取
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ arrayBuffer })
          text = result.value
        } else {
          // .doc 格式不支持纯前端解析，提示用户
          errors.value.push(`${file.name}: 旧版.doc格式不支持，请另存为.docx后重试`)
          progress.value = Math.round(((i + 1) / total) * 100)
          continue
        }
        
        if (text) {
          const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
          const fontSize = 12
          const lineHeight = 20
          const margin = 50
          const pageWidth = pdf.internal.pageSize.getWidth()
          const pageHeight = pdf.internal.pageSize.getHeight()
          const maxLineWidth = pageWidth - margin * 2
          
          pdf.setFontSize(fontSize)
          const lines = pdf.splitTextToSize(text, maxLineWidth) as string[]
          let y = margin
          for (const line of lines) {
            if (y > pageHeight - margin) {
              pdf.addPage()
              y = margin
            }
            pdf.text(line, margin, y)
            y += lineHeight
          }
          
          const blob = pdf.output('blob')
          const url = URL.createObjectURL(blob)
          const newName = file.name.replace(/\.docx?$/i, '') + '.pdf'
          convertedFiles.value.push({ name: newName, url, blob })
        }
        progress.value = Math.round(((i + 1) / total) * 100)
      } catch (e) {
        errors.value.push(`${files.value[i].name}: 转换失败`)
      }
    }
  } else if (convertType.value === 'mergepdf') {
    // 合并PDF
    try {
      const mergedPdf = await PDFDocument.create()
      for (let i = 0; i < files.value.length; i++) {
        try {
          const file = files.value[i]
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
          pages.forEach(p => mergedPdf.addPage(p))
          progress.value = Math.round(((i + 1) / total) * 100)
        } catch (e) {
          errors.value.push(`${files.value[i].name}: 加载失败`)
        }
      }
      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      convertedFiles.value.push({ name: '合并文档.pdf', url, blob })
    } catch (e: any) {
      errors.value.push('合并PDF失败: ' + e.message)
    }
  }
  
  progress.value = 100
  setTimeout(() => { converting.value = false }, 500)
}

function downloadFile(file: { name: string; url: string }) {
  const a = document.createElement('a')
  a.href = file.url
  a.download = file.name
  a.click()
}

function downloadAll() {
  convertedFiles.value.forEach(file => downloadFile(file))
}
</script>
