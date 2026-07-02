<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-purple-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">证件照制作</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!originalImage" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">上传照片</h3>
        
        <div
          @dragover.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          :class="['border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all', isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50']"
        >
          <input ref="fileInputRef" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
          <CameraIcon class="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p class="text-base font-medium text-gray-700 mb-1">点击或拖拽照片到此处</p>
          <p class="text-sm text-gray-500">支持 JPG、PNG 格式</p>
          <p class="text-xs text-gray-400 mt-2">建议上传正面免冠、浅色背景照片</p>
        </div>
      </div>

      <div v-if="originalImage" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl shadow-md p-4">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">
              原图
              <span v-if="cutoutMode === 'color'" class="text-xs text-purple-500 ml-2">点击背景区域选取颜色</span>
            </h3>
            <div
              :class="['relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center', cutoutMode === 'color' ? 'cursor-crosshair ring-2 ring-purple-300' : '']"
              style="height: 300px;"
              @click="cutoutMode === 'color' ? handleCanvasPick($event) : null"
            >
              <img :src="originalImage" alt="原图" class="max-w-full max-h-full object-contain pointer-events-none" />
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-md p-4">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">预览效果</h3>
            <div
              class="relative rounded-xl overflow-hidden flex items-center justify-center"
              :style="{ backgroundColor: selectedColor, height: '300px' }"
            >
              <canvas ref="previewCanvas" class="max-w-full max-h-full"></canvas>
              <div v-if="cutoutProcessing" class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <svg class="w-10 h-10 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-sm font-medium">AI抠图处理中...</p>
                <p class="text-xs text-white/70 mt-1">{{ cutoutProgress }}%</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">背景颜色</h3>
          <div class="flex flex-wrap gap-4">
            <button
              v-for="color in bgColors"
              :key="color.value"
              @click="selectColor(color.value)"
              :class="['w-14 h-14 rounded-xl border-4 transition-all hover:scale-105', selectedColor === color.value ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200']"
              :style="{ backgroundColor: color.value }"
              :title="color.label"
            >
              <span class="sr-only">{{ color.label }}</span>
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-3">当前：{{ currentColorLabel }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">抠图方式</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              @click="setCutoutMode('auto')"
              :class="['p-4 rounded-xl border-2 text-left transition-all', cutoutMode === 'auto' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300']"
            >
              <p class="font-medium text-gray-800">AI智能抠图</p>
              <p class="text-xs text-gray-500 mt-1">AI自动识别人像，效果最好</p>
            </button>
            <button
              @click="setCutoutMode('color')"
              :class="['p-4 rounded-xl border-2 text-left transition-all', cutoutMode === 'color' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300']"
            >
              <p class="font-medium text-gray-800">手动选取背景色</p>
              <p class="text-xs text-gray-500 mt-1">点击图片背景区域自动替换</p>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">照片尺寸</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="size in sizes"
              :key="size.value"
              @click="selectedSize = size.value"
              :class="['p-3 rounded-xl border-2 text-center transition-all', selectedSize === size.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300']"
            >
              <p class="font-medium text-gray-800">{{ size.label }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ size.desc }}</p>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">输出质量</h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="q in qualityOptions"
              :key="q.value"
              @click="quality = q.value"
              :class="['p-3 rounded-xl border-2 text-center transition-all', quality === q.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300']"
            >
              <p class="font-medium text-gray-800 text-sm">{{ q.label }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ q.desc }}</p>
            </button>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            @click="resetImage"
            class="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            重新上传
          </button>
          <button
            @click="downloadImage"
            :disabled="cutoutProcessing"
            class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon class="w-5 h-5 inline mr-2" />
            下载证件照
          </button>
        </div>
      </div>

      <div class="mt-6 bg-blue-50 rounded-xl p-5">
        <h4 class="font-semibold text-blue-800 mb-3">使用说明</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>建议上传纯色背景（白墙、蓝色幕布等）的正面照片</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>AI智能抠图：自动识别人像轮廓，效果最好（推荐）</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>手动选色：点击背景区域可精准选取要替换的颜色</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>所有处理均在浏览器本地完成，保护隐私</span>
          </li>
        </ul>
      </div>
    </main>
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ChevronLeftIcon, CameraIcon, CheckCircleIcon, DownloadIcon } from '@heroicons/vue/outline'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import { removeBackground } from '@imgly/background-removal'

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const originalImage = ref('')
const selectedColor = ref('#1E3A8A')
const selectedSize = ref('one')
const quality = ref(2)
const cutoutMode = ref('auto')
const originalImg = ref<HTMLImageElement | null>(null)
const pickedColor = ref<{ r: number; g: number; b: number } | null>(null)
const cutoutProcessing = ref(false)
const cutoutProgress = ref(0)
const cutoutBlob = ref<Blob | null>(null)
const cutoutImg = ref<HTMLImageElement | null>(null)

const bgColors = [
  { value: '#1E3A8A', label: '蓝色（标准证件照）' },
  { value: '#FFFFFF', label: '白色（护照/签证）' },
  { value: '#C41E3A', label: '红色（结婚照/社保）' },
  { value: '#0984E3', label: '浅蓝色（驾照）' },
  { value: '#00B894', label: '绿色（医保）' }
]

const sizes = [
  { value: 'one', label: '1寸', desc: '25×35mm', ratio: 25 / 35 },
  { value: 'two', label: '2寸', desc: '35×49mm', ratio: 35 / 49 },
  { value: 'small', label: '小2寸', desc: '33×48mm', ratio: 33 / 48 },
  { value: 'large', label: '大1寸', desc: '33×48mm', ratio: 33 / 48 }
]

const qualityOptions = [
  { value: 1, label: '标准', desc: '72DPI' },
  { value: 2, label: '高清', desc: '300DPI' },
  { value: 3, label: '超清', desc: '600DPI' }
]

const currentColorLabel = computed(() => {
  const color = bgColors.find(c => c.value === selectedColor.value)
  return color?.label || ''
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) loadImage(files[0])
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) loadImage(target.files[0])
}

function loadImage(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    cutoutBlob.value = null
    cutoutImg.value = null
    const img = new Image()
    img.onload = () => {
      originalImg.value = img
      nextTick(() => {
        if (cutoutMode.value === 'auto') {
          runAICutout()
        } else {
          updatePreview()
        }
      })
    }
    img.src = originalImage.value
  }
  reader.readAsDataURL(file)
}

async function runAICutout() {
  if (!originalImage.value) return
  cutoutProcessing.value = true
  cutoutProgress.value = 0
  try {
    const blob = await removeBackground(originalImage.value, {
      progress: (key: string, current: number, total: number) => {
        cutoutProgress.value = Math.round((current / total) * 100)
      }
    })
    cutoutBlob.value = blob
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      cutoutImg.value = img
      nextTick(() => updatePreview())
    }
    img.src = url
  } catch (e) {
    console.error('AI抠图失败:', e)
    alert('AI抠图失败，请重试或使用手动选色模式')
    cutoutMode.value = 'color'
  } finally {
    cutoutProcessing.value = false
  }
}

function selectColor(color: string) {
  selectedColor.value = color
  updatePreview()
}

function setCutoutMode(mode: string) {
  cutoutMode.value = mode
  if (mode === 'auto') {
    pickedColor.value = null
    if (originalImage.value && !cutoutImg.value) {
      runAICutout()
    } else {
      updatePreview()
    }
  } else {
    updatePreview()
  }
}

function handleCanvasPick(e: MouseEvent) {
  if (cutoutMode.value !== 'color' || !originalImg.value) return
  const img = originalImg.value
  const canvas = document.createElement('canvas')
  const scale = Math.min(300 / img.width, 400 / img.height)
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / rect.width * canvas.width)
  const y = Math.floor((e.clientY - rect.top) / rect.height * canvas.height)
  const pixel = ctx.getImageData(x, y, 1, 1).data
  pickedColor.value = { r: pixel[0], g: pixel[1], b: pixel[2] }
  updatePreview()
}

function updatePreview() {
  if (!previewCanvas.value || !originalImg.value) return
  
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const img = originalImg.value
  const scale = Math.min(300 / img.width, 400 / img.height)
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  
  ctx.fillStyle = selectedColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  if (cutoutMode.value === 'auto' && cutoutImg.value) {
    ctx.drawImage(cutoutImg.value, 0, 0, canvas.width, canvas.height)
  } else if (cutoutMode.value === 'color' && pickedColor.value) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const bgColor = hexToRgb(selectedColor.value)
    const target = pickedColor.value
    const threshold = 60
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      const diff = Math.sqrt(
        Math.pow(r - target.r, 2) +
        Math.pow(g - target.g, 2) +
        Math.pow(b - target.b, 2)
      )
      
      if (diff < threshold) {
        data[i] = bgColor.r
        data[i + 1] = bgColor.g
        data[i + 2] = bgColor.b
      } else if (diff < threshold + 25) {
        const blend = (diff - threshold) / 25
        data[i] = Math.round(r * blend + bgColor.r * (1 - blend))
        data[i + 1] = Math.round(g * blend + bgColor.g * (1 - blend))
        data[i + 2] = Math.round(b * blend + bgColor.b * (1 - blend))
      }
    }
    ctx.putImageData(imageData, 0, 0)
  } else {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

async function downloadImage() {
  if (!originalImg.value) return
  
  const sizeObj = sizes.find(s => s.value === selectedSize.value)!
  const ratio = sizeObj.ratio
  const qualityMultiplier = [1, 1.5, 2.5][quality.value - 1] || 1
  
  const outCanvas = document.createElement('canvas')
  const ctx = outCanvas.getContext('2d')!
  
  let sourceImg: HTMLImageElement | null = null
  if (cutoutMode.value === 'auto' && cutoutImg.value) {
    sourceImg = cutoutImg.value
  } else {
    sourceImg = originalImg.value
  }
  
  let outputWidth = sourceImg.width * qualityMultiplier
  let outputHeight = outputWidth / ratio
  
  if (outputHeight > sourceImg.height * qualityMultiplier) {
    outputHeight = sourceImg.height * qualityMultiplier
    outputWidth = outputHeight * ratio
  }
  
  outCanvas.width = Math.round(outputWidth)
  outCanvas.height = Math.round(outputHeight)
  
  ctx.fillStyle = selectedColor.value
  ctx.fillRect(0, 0, outCanvas.width, outCanvas.height)
  
  const drawHeight = outCanvas.height
  const drawWidth = drawHeight * (sourceImg.width / sourceImg.height)
  const x = (outCanvas.width - drawWidth) / 2
  
  if (cutoutMode.value === 'auto' && cutoutImg.value) {
    ctx.drawImage(cutoutImg.value, x, 0, drawWidth, drawHeight)
  } else if (cutoutMode.value === 'color' && pickedColor.value) {
    ctx.drawImage(originalImg.value, x, 0, drawWidth, drawHeight)
    const imageData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height)
    const data = imageData.data
    const bgColor = hexToRgb(selectedColor.value)
    const target = pickedColor.value
    const threshold = 60
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const diff = Math.sqrt(Math.pow(r - target.r, 2) + Math.pow(g - target.g, 2) + Math.pow(b - target.b, 2))
      if (diff < threshold) {
        data[i] = bgColor.r
        data[i + 1] = bgColor.g
        data[i + 2] = bgColor.b
      } else if (diff < threshold + 25) {
        const blend = (diff - threshold) / 25
        data[i] = Math.round(r * blend + bgColor.r * (1 - blend))
        data[i + 1] = Math.round(g * blend + bgColor.g * (1 - blend))
        data[i + 2] = Math.round(b * blend + bgColor.b * (1 - blend))
      }
    }
    ctx.putImageData(imageData, 0, 0)
  } else {
    ctx.drawImage(originalImg.value, x, 0, drawWidth, drawHeight)
  }
  
  const link = document.createElement('a')
  link.download = `证件照_${currentColorLabel.value.split('（')[0]}_${sizeObj.label}.jpg`
  link.href = outCanvas.toDataURL('image/jpeg', 0.95)
  link.click()
}

function resetImage() {
  originalImage.value = ''
  originalImg.value = null
  pickedColor.value = null
  cutoutBlob.value = null
  cutoutImg.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>
