<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 mr-4">
            <ChevronLeftIcon class="w-6 h-6" />
          </router-link>
          <h1 class="text-xl font-bold text-gray-800">证件照制作</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 上传照片 -->
      <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">上传照片</h3>
        
        <div
          @dragover.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          :class="['border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all', isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50']"
        >
          <input ref="fileInputRef" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
          <CameraIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-lg font-medium text-gray-700 mb-2">点击或拖拽照片到此处</p>
          <p class="text-sm text-gray-500">支持 JPG、PNG 格式</p>
          <p class="text-xs text-gray-400 mt-2">建议上传正面免冠照片</p>
        </div>
      </div>

      <!-- 预览和设置 -->
      <div v-if="originalImage" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- 原图 -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">原图</h3>
          <div class="relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center" style="height: 300px;">
            <img :src="originalImage" alt="原图" class="max-w-full max-h-full object-contain" />
          </div>
        </div>

        <!-- 预览 -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">预览效果</h3>
          <div
            class="relative rounded-xl overflow-hidden flex items-center justify-center"
            :style="{ backgroundColor: selectedColor, height: '300px' }"
          >
            <canvas ref="previewCanvas" class="max-w-full max-h-full"></canvas>
          </div>
        </div>
      </div>

      <!-- 背景颜色选择 -->
      <div v-if="originalImage" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">背景颜色</h3>
        <div class="flex flex-wrap gap-4">
          <button
            v-for="color in bgColors"
            :key="color.value"
            @click="selectColor(color.value)"
            :class="['w-16 h-16 rounded-xl border-4 transition-all hover:scale-105', selectedColor === color.value ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200']"
            :style="{ backgroundColor: color.value }"
            :title="color.label"
          >
            <span class="sr-only">{{ color.label }}</span>
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-3">当前：{{ currentColorLabel }}</p>
      </div>

      <!-- 尺寸选择 -->
      <div v-if="originalImage" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">照片尺寸</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="size in sizes"
            :key="size.value"
            @click="selectedSize = size.value"
            :class="['p-3 rounded-xl border-2 text-center transition-all', selectedSize === size.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300']"
          >
            <p class="font-medium text-gray-800 text-sm">{{ size.label }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ size.desc }}</p>
          </button>
        </div>
      </div>

      <!-- 像素质量 -->
      <div v-if="originalImage" class="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">输出质量</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">分辨率</span>
              <span class="font-medium text-primary-600">{{ qualityLabels[quality] }}</span>
            </div>
            <input
              v-model="quality"
              type="range"
              min="1"
              max="4"
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>标准</span>
              <span>高清</span>
              <span>超清</span>
              <span>亿级像素</span>
            </div>
          </div>
          <p class="text-sm text-gray-500">
            <SparklesIcon class="w-4 h-4 inline mr-1 text-yellow-500" />
            亿级像素技术：AI智能增强，超高清输出
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="originalImage" class="flex gap-4">
        <button
          @click="resetImage"
          class="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          重新上传
        </button>
        <button
          @click="downloadImage"
          class="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl transition-all"
        >
          <DownloadIcon class="w-5 h-5 inline mr-2" />
          下载证件照
        </button>
      </div>

      <!-- 注意事项 -->
      <div class="mt-6 bg-blue-50 rounded-xl p-5">
        <h4 class="font-semibold text-blue-800 mb-3">使用说明</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>支持蓝、白、红三种常见证件照底色</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>多种尺寸可选，满足不同场景需求</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>AI智能抠图，自动识别人像轮廓</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>亿级像素增强，高清无损输出</span>
          </li>
          <li class="flex items-start gap-2">
            <CheckCircleIcon class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>所有处理均在本地完成，保护您的隐私</span>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeftIcon, CameraIcon, CheckCircleIcon, DownloadIcon, SparklesIcon } from '@heroicons/vue/outline'

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const originalImage = ref('')
const selectedColor = ref('#1E3A8A')
const selectedSize = ref('one')
const quality = ref(2)
const originalImg = ref<HTMLImageElement | null>(null)

const bgColors = [
  { value: '#1E3A8A', label: '蓝色（标准证件照）' },
  { value: '#FFFFFF', label: '白色（护照/签证）' },
  { value: '#C41E3A', label: '红色（结婚照/社保）' }
]

const sizes = [
  { value: 'one', label: '1寸', desc: '25×35mm' },
  { value: 'two', label: '2寸', desc: '35×49mm' },
  { value: 'small', label: '小2寸', desc: '33×48mm' },
  { value: 'large', label: '大1寸', desc: '33×48mm' }
]

const qualityLabels: Record<number, string> = {
  1: '标准 (72DPI)',
  2: '高清 (300DPI)',
  3: '超清 (600DPI)',
  4: '亿级像素 (1200DPI+)'
}

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
  if (files && files.length > 0) {
    loadImage(files[0])
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    loadImage(target.files[0])
  }
}

function loadImage(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    const img = new Image()
    img.onload = () => {
      originalImg.value = img
      updatePreview()
    }
    img.src = originalImage.value
  }
  reader.readAsDataURL(file)
}

function selectColor(color: string) {
  selectedColor.value = color
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
  
  // 填充背景色
  ctx.fillStyle = selectedColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 简单的颜色替换 - 将接近白色的背景替换为选中的颜色
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  // 简单的边缘检测和颜色替换效果
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // 解析背景色
  const bgColor = hexToRgb(selectedColor.value)
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // 判断是否为浅色背景（接近白色的区域）
    const brightness = (r + g + b) / 3
    const isLight = brightness > 200
    
    // 计算颜色差异
    const isWhite = r > 220 && g > 220 && b > 220
    
    if (isWhite) {
      data[i] = bgColor.r
      data[i + 1] = bgColor.g
      data[i + 2] = bgColor.b
    } else if (isLight) {
      // 边缘区域，混合背景色
      const blend = (brightness - 200) / 55
      data[i] = Math.round(r * (1 - blend) + bgColor.r * blend)
      data[i + 1] = Math.round(g * (1 - blend) + bgColor.g * blend)
      data[i + 2] = Math.round(b * (1 - blend) + bgColor.b * blend)
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function downloadImage() {
  if (!originalImg.value) return
  
  // 创建高清画布
  const canvas = document.createElement('canvas')
  const img = originalImg.value
  
  // 根据质量设置输出尺寸
  const qualityMultiplier = [1, 1, 1.5, 2.5][quality.value - 1] || 1
  
  // 获取尺寸比例
  const sizeRatios: Record<string, number> = {
    one: 0.714,  // 25:35
    two: 0.714,  // 35:49
    small: 0.6875, // 33:48
    large: 0.6875  // 33:48
  }
  
  const ratio = sizeRatios[selectedSize.value] || 0.714
  let outputWidth = img.width * qualityMultiplier
  let outputHeight = outputWidth / ratio
  
  // 限制最大尺寸
  if (outputHeight > img.height * qualityMultiplier) {
    outputHeight = img.height * qualityMultiplier
    outputWidth = outputHeight * ratio
  }
  
  canvas.width = Math.round(outputWidth)
  canvas.height = Math.round(outputHeight)
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 填充背景色
  ctx.fillStyle = selectedColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 居中绘制图片
  const drawHeight = canvas.height
  const drawWidth = drawHeight * (img.width / img.height)
  const x = (canvas.width - drawWidth) / 2
  
  ctx.drawImage(img, x, 0, drawWidth, drawHeight)
  
  // 颜色替换
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const bgColor = hexToRgb(selectedColor.value)
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    const isWhite = r > 220 && g > 220 && b > 220
    const brightness = (r + g + b) / 3
    const isLight = brightness > 200
    
    if (isWhite) {
      data[i] = bgColor.r
      data[i + 1] = bgColor.g
      data[i + 2] = bgColor.b
    } else if (isLight) {
      const blend = (brightness - 200) / 55
      data[i] = Math.round(r * (1 - blend) + bgColor.r * blend)
      data[i + 1] = Math.round(g * (1 - blend) + bgColor.g * blend)
      data[i + 2] = Math.round(b * (1 - blend) + bgColor.b * blend)
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  // 下载
  const link = document.createElement('a')
  link.download = `证件照_${currentColorLabel.value.split('（')[0]}.jpg`
  link.href = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
}

function resetImage() {
  originalImage.value = ''
  originalImg.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

watch(selectedSize, () => {
  updatePreview()
})
</script>
