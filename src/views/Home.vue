<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- 强制公告弹窗 -->
    <div v-if="showAnnouncement" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border-4 border-orange-400">
        <div class="bg-gradient-to-r from-orange-500 to-amber-500 p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ExclamationIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">重要通知</h3>
              <p class="text-orange-100 text-sm">请务必仔细阅读以下内容</p>
            </div>
          </div>
        </div>
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <span class="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">一</span>
              <div>
                <p class="font-semibold text-orange-900">保存好支付记录</p>
                <p class="text-sm text-orange-700 mt-1">支付完成后，请务必保存好转账截图和支付凭证，订单备注必须准确填写，以便客服核实。</p>
              </div>
            </div>
          </div>
          <div class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">二</span>
              <div>
                <p class="font-semibold text-red-900">金额必须准确</p>
                <p class="text-sm text-red-700 mt-1">转账金额必须与订单金额完全一致，少付或多付都可能导致系统识别失败，影响订单处理进度。</p>
              </div>
            </div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <span class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">三</span>
              <div>
                <p class="font-semibold text-blue-900">客服联系方式</p>
                <p class="text-sm text-blue-700 mt-1">如有任何问题，请及时联系客服微信：<span class="font-mono font-bold">wxid_jv428py2ftir22</span></p>
                <p class="text-sm text-blue-600 mt-1">工作时间：每天 9:00 - 22:00</p>
              </div>
            </div>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <span class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">四</span>
              <div>
                <p class="font-semibold text-green-900">上传凭证截图</p>
                <p class="text-sm text-green-700 mt-1">支付完成后，请在订单页面上传转账截图，客服核实后订单将自动进入处理流程。</p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100">
          <button 
            @click="closeAnnouncement"
            class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all font-semibold text-base shadow-lg shadow-orange-200"
          >
            我已阅读，知道了
          </button>
        </div>
      </div>
    </div>

    <!-- 顶部导航 -->
    <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span class="text-white text-xl font-bold">校</span>
            </div>
            <div>
              <span class="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">校园好帮手</span>
              <p class="text-xs text-gray-400 -mt-1">便捷校园生活</p>
            </div>
          </div>
          
          <nav class="hidden md:flex items-center gap-8">
            <router-link to="/" class="text-gray-700 hover:text-orange-600 transition-colors font-medium">首页</router-link>
            <router-link to="/order" class="text-gray-600 hover:text-orange-600 transition-colors">我的订单</router-link>
            <button @click="showContact = true" class="text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-1">
              <ChatAltIcon class="w-4 h-4" />
              联系客服
            </button>
          </nav>
          
          <div class="flex items-center gap-4">
            <template v-if="visitorPhone">
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center ring-2 ring-orange-200">
                  <span class="text-orange-600 font-medium">{{ visitorPhone.slice(-2) }}</span>
                </div>
                <span class="hidden sm:block text-gray-700">{{ formatPhone(visitorPhone) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 shadow-2xl">
      <div class="flex justify-around py-2">
        <router-link to="/" class="flex flex-col items-center gap-1 text-gray-500">
          <HomeIcon class="w-6 h-6" />
          <span class="text-xs font-medium">首页</span>
        </router-link>
        <router-link to="/order" class="flex flex-col items-center gap-1 text-gray-500">
          <ClipboardListIcon class="w-6 h-6" />
          <span class="text-xs font-medium">订单</span>
        </router-link>
        <button @click="showContact = true" class="flex flex-col items-center gap-1 text-gray-500">
          <ChatAltIcon class="w-6 h-6" />
          <span class="text-xs font-medium">客服</span>
        </button>
        <router-link to="/profile" class="flex flex-col items-center gap-1 text-gray-500">
          <UserIcon class="w-6 h-6" />
          <span class="text-xs font-medium">我的</span>
        </router-link>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="pb-24 md:pb-12">
      <!-- 公告栏 -->
      <div class="bg-amber-50 border-b border-amber-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-3">
            <span class="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">公告</span>
            <div class="overflow-hidden flex-1">
              <div class="whitespace-nowrap animate-marquee">
                <span class="text-amber-800 text-sm">
                  欢迎使用嘉驰校园服务平台！下单后请在30分钟内完成支付，超时订单将自动取消。如有问题请联系客服微信：wxid_jv428py2ftir22
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero区域 -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.15),transparent_50%)]"></div>
        <div class="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-12 -left-12 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <SparklesIcon class="w-4 h-4" />
              <span>校园生活 · 轻松搞定</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              让校园生活<br />
              <span class="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">更简单更美好</span>
            </h1>
            <p class="text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              校内包裹配送服务、写字服务、文件打印、课业时长整理服务，专业团队为您服务，省时省力又省心
            </p>
            <div class="flex flex-wrap gap-4">
              <router-link to="/express" class="group inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1">
                <TruckIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
                校内包裹配送服务
                <ArrowRightIcon class="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </router-link>
              <router-link to="/handwriting" class="group inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 hover:-translate-y-1 border border-white/30">
                <PencilIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
                写字服务
                <ArrowRightIcon class="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </router-link>
              <router-link to="/print" class="group inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 hover:-translate-y-1 border border-white/30">
                <PrinterIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
                文件打印
                <ArrowRightIcon class="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </router-link>
              <router-link to="/course" class="group inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 hover:-translate-y-1 border border-white/30">
                <AcademicCapIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
                课业时长整理服务
                <ArrowRightIcon class="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </router-link>
            </div>
            
            <!-- 数据统计 -->
            <div class="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/20">
              <div>
                <p class="text-3xl md:text-4xl font-bold text-white">1000+</p>
                <p class="text-white/70 text-sm mt-1">服务学生</p>
              </div>
              <div>
                <p class="text-3xl md:text-4xl font-bold text-white">99%</p>
                <p class="text-white/70 text-sm mt-1">好评率</p>
              </div>
              <div>
                <p class="text-3xl md:text-4xl font-bold text-white">30min</p>
                <p class="text-white/70 text-sm mt-1">快速响应</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 波浪装饰 -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      <!-- 服务卡片 -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-10">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-3">精选服务</h2>
          <p class="text-gray-500">为您提供优质的校园生活服务</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 校内包裹配送服务卡片 -->
          <router-link to="/express" class="group relative bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <TruckIcon class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">校内包裹配送服务</h3>
              <p class="text-gray-500 text-sm mb-4 leading-relaxed">输入取件码即可下单，送货到宿舍门口</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">小件 ¥{{ prices.express_small_price }}起</span>
                <span class="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">加急配送</span>
              </div>
              <div class="flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                <span>立即下单</span>
                <ArrowRightIcon class="w-4 h-4" />
              </div>
            </div>
          </router-link>

          <!-- 写字服务卡片 -->
          <router-link to="/handwriting" class="group relative bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <PencilIcon class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">写字服务</h3>
              <p class="text-gray-500 text-sm mb-4 leading-relaxed">多种手写字体可选，专业代写服务</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">¥{{ prices.handwriting_price }}/百字</span>
                <span class="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">多种字体</span>
              </div>
              <div class="flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                <span>立即下单</span>
                <ArrowRightIcon class="w-4 h-4" />
              </div>
            </div>
          </router-link>

          <!-- 打印服务卡片 -->
          <router-link to="/print" class="group relative bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <PrinterIcon class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">文件打印服务</h3>
              <p class="text-gray-500 text-sm mb-4 leading-relaxed">支持PDF、Word、图片等多种格式</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">黑白 ¥{{ prices.black_print_price }}</span>
                <span class="px-2 py-1 bg-cyan-50 text-cyan-600 text-xs rounded-full">彩色 ¥{{ prices.color_print_price }}</span>
              </div>
              <div class="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                <span>立即下单</span>
                <ArrowRightIcon class="w-4 h-4" />
              </div>
            </div>
          </router-link>

          <!-- 课业时长整理服务卡片 -->
          <router-link to="/course" class="group relative bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                <AcademicCapIcon class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">课业时长整理服务</h3>
              <p class="text-gray-500 text-sm mb-4 leading-relaxed">多平台网课学习辅助服务</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">¥{{ prices.course_base_price }}/门</span>
                <span class="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">100%完成</span>
              </div>
              <div class="flex items-center text-green-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                <span>立即下单</span>
                <ArrowRightIcon class="w-4 h-4" />
              </div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- 免费工具 -->
      <section class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <SparklesIcon class="w-4 h-4" />
              完全免费
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-3">实用工具</h2>
            <p class="text-gray-500">免费好用的在线工具，提升学习效率</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <!-- PDF转换工具 -->
            <router-link to="/tools/pdf-convert" class="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-lg shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-blue-100">
              <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="relative">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <DocumentDuplicateIcon class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-3">PDF转换工具</h3>
                <p class="text-gray-600 mb-6 leading-relaxed">支持PDF与Word、Excel、PPT互转，保留原始格式，高效便捷</p>
                <div class="flex flex-wrap gap-2 mb-6">
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">PDF转Word</span>
                  <span class="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded-full">PDF转Excel</span>
                  <span class="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full">PDF转PPT</span>
                  <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">反向转换</span>
                </div>
                <div class="flex items-center text-blue-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>立即使用</span>
                  <ArrowRightIcon class="w-5 h-5" />
                </div>
              </div>
            </router-link>

            <!-- 证件照制作 -->
            <router-link to="/tools/id-photo" class="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-lg shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-purple-100">
              <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div class="relative">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                  <CameraIcon class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-3">证件照制作</h3>
                <p class="text-gray-600 mb-6 leading-relaxed">一键换背景色，蓝白红三色可选，亿级像素高清输出</p>
                <div class="flex flex-wrap gap-2 mb-6">
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">蓝色背景</span>
                  <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">白色背景</span>
                  <span class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">红色背景</span>
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">亿级像素</span>
                </div>
                <div class="flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>立即使用</span>
                  <ArrowRightIcon class="w-5 h-5" />
                </div>
              </div>
            </router-link>

            <!-- 图片压缩 -->
            <router-link to="/tools/image-compress" class="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-lg shadow-green-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-green-100">
              <div class="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">免费</div>
              <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                <PhotographIcon class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-3">图片压缩</h3>
              <p class="text-gray-500 mb-4">批量压缩图片体积，支持自定义质量和尺寸</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">批量处理</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">自定义质量</span>
                <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">本地处理</span>
              </div>
              <div class="flex items-center text-green-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                <span>立即使用</span>
                <ArrowRightIcon class="w-5 h-5" />
              </div>
            </router-link>

            <!-- 图片格式转换 -->
            <router-link to="/tools/image-convert" class="group relative bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-lg shadow-cyan-100/50 hover:shadow-2xl hover:shadow-cyan-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-cyan-100">
              <div class="absolute top-4 right-4 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">免费</div>
              <div class="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                <RefreshIcon class="w-7 h-7 text-white" />
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-3">图片格式转换</h3>
              <p class="text-gray-500 mb-4">JPG、PNG、WebP 三种格式互相转换</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded-full">JPG</span>
                <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">PNG</span>
                <span class="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full">WebP</span>
              </div>
              <div class="flex items-center text-cyan-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                <span>立即使用</span>
                <ArrowRightIcon class="w-5 h-5" />
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- 服务特色 -->
      <section class="bg-gradient-to-b from-gray-50 to-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-800 mb-3">为什么选择我们</h2>
            <p class="text-gray-500">专业、可靠、贴心的校园服务</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ClockIcon class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">快速响应</h3>
              <p class="text-gray-500 leading-relaxed">下单后30分钟内响应，加急订单优先处理，让您不用久等</p>
            </div>
            
            <div class="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">安全可靠</h3>
              <p class="text-gray-500 leading-relaxed">专业团队操作，物品安全有保障，全程可追踪订单状态</p>
            </div>
            
            <div class="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartIcon class="w-8 h-8 text-pink-600" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">贴心服务</h3>
              <p class="text-gray-500 leading-relaxed">送货到宿舍门口，客服在线答疑，让您享受优质服务体验</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 使用流程 -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-3">简单三步，轻松下单</h2>
          <p class="text-gray-500">便捷的操作流程，省时又省力</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div class="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200"></div>
          
          <div class="relative text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200 relative z-10">
              <span class="text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">选择服务</h3>
            <p class="text-gray-500 leading-relaxed">选择校内包裹配送服务或写字服务，填写相关信息</p>
          </div>
          
          <div class="relative text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-200 relative z-10">
              <span class="text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">在线支付</h3>
            <p class="text-gray-500 leading-relaxed">支持多种支付方式，安全便捷有保障</p>
          </div>
          
          <div class="relative text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200 relative z-10">
              <span class="text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">等待完成</h3>
            <p class="text-gray-500 leading-relaxed">我们尽快处理，完成后送货到指定地点</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-900 text-gray-400 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">校</span>
              </div>
              <span class="text-lg font-bold text-white">校园好帮手</span>
            </div>
            <p class="text-sm leading-relaxed">专注校园生活服务，让您的校园生活更加便捷美好</p>
          </div>
          
          <div>
            <h4 class="text-white font-semibold mb-4">帮助中心</h4>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/order" class="hover:text-orange-400 transition-colors">我的订单</router-link></li>
              <li><router-link to="/profile" class="hover:text-orange-400 transition-colors">个人中心</router-link></li>
              <li><button @click="showContact = true" class="hover:text-orange-400 transition-colors">联系客服</button></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© 2026 嘉驰校园服务 版权所有</p>
          <p class="mt-2 text-gray-500">仅供学习交流使用</p>
        </div>
      </div>
    </footer>

    <!-- 联系客服弹窗 -->
    <div v-if="showContact" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showContact = false">
      <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChatAltIcon class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-white">联系客服</h3>
          <p class="text-green-100 text-sm mt-1">有任何问题，随时联系我们</p>
        </div>
        <div class="p-6 space-y-5">
          <div class="bg-gray-50 rounded-2xl p-4">
            <p class="text-gray-500 text-sm mb-2">微信客服</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-gray-800 font-mono">wxid_jv428py2ftir22</span>
              <button @click="copyWechat" class="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">复制微信号后，在微信中搜索添加</p>
          </div>
          <div class="bg-orange-50 rounded-2xl p-4">
            <p class="text-sm text-orange-700">
              <strong>服务时间：</strong>每天 8:00 - 22:00<br/>
              <strong>响应时效：</strong>一般30分钟内回复
            </p>
          </div>
          <button @click="showContact = false" class="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 重要公告弹窗 -->
    <div v-if="showAnnouncement" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border-2 border-orange-500">
        <div class="text-center mb-4">
          <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ExclamationIcon class="w-10 h-10 text-orange-600" />
          </div>
          <h2 class="text-xl font-bold text-orange-600">重要公告</h2>
          <p class="text-sm text-gray-500 mt-1">下单前必看，请仔细阅读</p>
        </div>
        
        <div class="bg-orange-50 rounded-xl p-4 mb-5 border border-orange-200">
          <p class="text-gray-800 leading-relaxed text-sm">
            下单时请保存付款记录，并上传截图。后台审核通过后，我们会火速处理您的单子。
          </p>
          <p class="text-red-600 font-medium mt-3 text-sm">
            ⚠️ 千万不要多付或少付，否则后台识别不成功！
          </p>
          <p class="text-gray-600 mt-3 text-sm">
            有疑问请联系客服。
          </p>
        </div>
        
        <button @click="closeAnnouncement" class="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
          我已阅读，知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HomeIcon, ClipboardListIcon, UserIcon, TruckIcon, PencilIcon, SparklesIcon, ArrowRightIcon, ClockIcon, ShieldCheckIcon, HeartIcon, DocumentDuplicateIcon, CameraIcon, PrinterIcon, AcademicCapIcon, ChatAltIcon, PhotographIcon, RefreshIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { publicApi } from '@/api'

const visitorPhone = ref('')
const showContact = ref(false)
const copied = ref(false)
const showAnnouncement = ref(false)

function closeAnnouncement() {
  showAnnouncement.value = false
  localStorage.setItem('announcement_read', 'true')
}

async function copyWechat() {
  try {
    await navigator.clipboard.writeText('wxid_jv428py2ftir22')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // 降级方案
    const input = document.createElement('input')
    input.value = 'wxid_jv428py2ftir22'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const prices = ref({
  express_small_price: '0.1',
  express_large_price: '2.5',
  black_print_price: '0.3',
  color_print_price: '0.5',
  course_base_price: '1.7',
  handwriting_price: '1.5'
})

onMounted(async () => {
  visitorPhone.value = localStorage.getItem('visitor_phone') || ''
  
  // 检查是否已阅读公告（每次访问都显示，除非用户主动关闭）
  const announcementRead = localStorage.getItem('announcement_read')
  if (!announcementRead) {
    showAnnouncement.value = true
  }
  
  try {
    const res: any = await publicApi.getServicePrices()
    if (res.code === 0 && res.data) {
      prices.value = { ...prices.value, ...res.data }
    }
  } catch (e) {}
})

function formatPhone(phone: string) {
  if (phone.length === 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }
  return phone
}
</script>
