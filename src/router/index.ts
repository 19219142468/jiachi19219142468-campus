import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/print',
    name: 'Print',
    component: () => import('@/views/Print.vue')
  },
  {
    path: '/course',
    name: 'Course',
    component: () => import('@/views/Course.vue')
  },
  {
    path: '/express',
    name: 'Express',
    component: () => import('@/views/Express.vue')
  },
  {
    path: '/handwriting',
    name: 'Handwriting',
    component: () => import('@/views/Handwriting.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue')
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/profile/addresses',
    name: 'Addresses',
    component: () => import('@/views/Addresses.vue')
  },
  {
    path: '/profile/balance',
    name: 'Balance',
    component: () => import('@/views/Balance.vue')
  },
  {
    path: '/pay/:orderId',
    name: 'Pay',
    component: () => import('@/views/Pay.vue')
  },
  {
    path: '/tools/pdf-convert',
    name: 'PdfConvert',
    component: () => import('@/views/tools/PdfConvert.vue')
  },
  {
    path: '/tools/id-photo',
    name: 'IdPhoto',
    component: () => import('@/views/tools/IdPhoto.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Index.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/Orders.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/Users.vue') },
      { path: 'services', name: 'AdminServices', component: () => import('@/views/admin/Services.vue') },
      { path: 'finance', name: 'AdminFinance', component: () => import('@/views/admin/Finance.vue') },
      { path: 'withdraw', name: 'AdminWithdraw', component: () => import('@/views/admin/Withdraw.vue') }
    ]
  },
  {
    path: '/super-admin/login',
    name: 'SuperAdminLogin',
    component: () => import('@/views/super-admin/Login.vue')
  },
  {
    path: '/super-admin',
    name: 'SuperAdmin',
    component: () => import('@/views/super-admin/Index.vue'),
    children: [
      { path: '', redirect: '/super-admin/dashboard' },
      { path: 'dashboard', name: 'SuperAdminDashboard', component: () => import('@/views/super-admin/Dashboard.vue') },
      { path: 'pending-confirm', name: 'SuperAdminPendingConfirm', component: () => import('@/views/super-admin/PendingConfirmOrders.vue') },
      { path: 'orders', name: 'SuperAdminOrders', component: () => import('@/views/super-admin/Orders.vue') },
      { path: 'agents', name: 'SuperAdminAgents', component: () => import('@/views/super-admin/Agents.vue') },
      { path: 'users', name: 'SuperAdminUsers', component: () => import('@/views/super-admin/Users.vue') },
      { path: 'services', name: 'SuperAdminServices', component: () => import('@/views/super-admin/Services.vue') },
      { path: 'finance', name: 'SuperAdminFinance', component: () => import('@/views/super-admin/Finance.vue') },
      { path: 'payment-records', name: 'SuperAdminPaymentRecords', component: () => import('@/views/super-admin/PaymentRecords.vue') },
      { path: 'agent-withdrawals', name: 'SuperAdminAgentWithdrawals', component: () => import('@/views/super-admin/AgentWithdrawals.vue') }
    ]
  },
  {
    path: '/agent/login',
    name: 'AgentLogin',
    component: () => import('@/views/agent/Login.vue')
  },
  {
    path: '/agent',
    name: 'Agent',
    component: () => import('@/views/agent/Index.vue'),
    children: [
      { path: '', redirect: '/agent/dashboard' },
      { path: 'dashboard', name: 'AgentDashboard', component: () => import('@/views/agent/Dashboard.vue') },
      { path: 'pool', name: 'AgentPool', component: () => import('@/views/agent/Pool.vue') },
      { path: 'orders', name: 'AgentOrders', component: () => import('@/views/agent/Orders.vue') },
      { path: 'wallet', name: 'AgentWallet', component: () => import('@/views/agent/Wallet.vue') },
      { path: 'profile', name: 'AgentProfile', component: () => import('@/views/agent/Profile.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const superAdminToken = localStorage.getItem('super_admin_token')
  const agentToken = localStorage.getItem('agent_token')
  
  const isAdminRoute = to.path.startsWith('/admin')
  const isSuperAdminRoute = to.path.startsWith('/super-admin')
  const isAgentRoute = to.path.startsWith('/agent')
  const isToolRoute = to.path.startsWith('/tools')
  
  if (isSuperAdminRoute) {
    if (to.path === '/super-admin/login') {
      if (superAdminToken) {
        next('/super-admin/dashboard')
        return
      }
      next()
      return
    }
    if (!superAdminToken) {
      next('/super-admin/login')
      return
    }
    next()
    return
  }
  
  if (isAgentRoute) {
    if (to.path === '/agent/login') {
      if (agentToken) {
        next('/agent/dashboard')
        return
      }
      next()
      return
    }
    if (!agentToken) {
      next('/agent/login')
      return
    }
    next()
    return
  }
  
  if (isAdminRoute && token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      next('/')
      return
    }
  }
  
  next()
})

export default router
