import axios from 'axios'
import type { ApiResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use((config) => {
  let token = ''
  const url = config.url || ''
  
  if (url.startsWith('/super-admin/')) {
    token = localStorage.getItem('super_admin_token') || ''
  } else if (url.startsWith('/agent/')) {
    token = localStorage.getItem('agent_token') || ''
  } else {
    token = localStorage.getItem('token') || ''
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      
      if (url.startsWith('/super-admin/')) {
        localStorage.removeItem('super_admin_token')
        localStorage.removeItem('super_admin')
        window.location.href = '/super-admin/login'
      } else if (url.startsWith('/agent/')) {
        localStorage.removeItem('agent_token')
        localStorage.removeItem('agent')
        window.location.href = '/agent/login'
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  sendCode: (phone: string) => api.post<ApiResponse>('/auth/sendCode', { phone }),
  register: (phone: string, code: string, password: string) => 
    api.post<ApiResponse>('/auth/register', { phone, code, password }),
  login: (phone: string, password: string) => 
    api.post<ApiResponse>('/auth/login', { phone, password }),
  getUserInfo: () => api.get<ApiResponse>('/auth/userinfo')
}

export const publicApi = {
  getServicePrices: () => api.get<ApiResponse>('/services/prices'),
  getPaymentQrcode: () => api.get<ApiResponse>('/payment/qrcode')
}

export const userApi = {
  getProfile: () => api.get<ApiResponse>('/user/profile'),
  updateProfile: (data: { nickname?: string; avatar?: string }) => 
    api.put<ApiResponse>('/user/profile', data),
  getAddresses: () => api.get<ApiResponse>('/user/addresses'),
  addAddress: (data: { name: string; phone: string; location: string; detail: string; is_default: boolean }) =>
    api.post<ApiResponse>('/user/addresses', data),
  updateAddress: (id: number, data: any) => api.put<ApiResponse>(`/user/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete<ApiResponse>(`/user/addresses/${id}`)
}

export const orderApi = {
  createPrintOrder: (data: any) => api.post<ApiResponse>('/orders/print', data),
  createCourseOrder: (data: any) => api.post<ApiResponse>('/orders/course', data),
  createExpressOrder: (data: any) => api.post<ApiResponse>('/orders/express', data),
  createHandwritingOrder: (data: any) => api.post<ApiResponse>('/orders/handwriting', data),
  getOrders: (params?: { status?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse>('/orders', { params }),
  getOrdersByPhone: (params: { phone: string; status?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse>('/orders/public', { params }),
  getOrderDetail: (id: number) => api.get<ApiResponse>(`/orders/${id}`),
  getOrderDetailByPhone: (id: number, phone: string) => 
    api.get<ApiResponse>(`/orders/phone/${id}`, { params: { phone } }),
  cancelOrder: (id: number) => api.put<ApiResponse>(`/orders/${id}/cancel`),
  confirmTransfer: (id: number) => api.put<ApiResponse>(`/orders/${id}/confirm-transfer`)
}

export const payApi = {
  createPayment: (orderId: number, payMethod: 'alipay' | 'wechat') =>
    api.post<ApiResponse>('/pay/create', { order_id: orderId, pay_method: payMethod }),
  getPayStatus: (orderId: number) => api.get<ApiResponse>(`/pay/status/${orderId}`),
  getPayResult: (orderId: number) => api.get<ApiResponse>(`/pay/result/${orderId}`),
  verifyPayment: (orderId: number) => api.get<ApiResponse>(`/pay/verify/${orderId}`)
}

export const financeApi = {
  getBalance: () => api.get<ApiResponse>('/finance/balance'),
  recharge: (amount: number, payMethod: 'alipay' | 'wechat') =>
    api.post<ApiResponse>('/finance/recharge', { amount, pay_method: payMethod }),
  withdraw: (amount: number, account: string, type: 'alipay' | 'wechat') =>
    api.post<ApiResponse>('/finance/withdraw', { amount, account, type }),
  getRecords: (params?: { type?: string; page?: number }) =>
    api.get<ApiResponse>('/finance/records', { params })
}

export const adminApi = {
  getStats: () => api.get<ApiResponse>('/admin/stats'),
  getAllOrders: (params?: any) => api.get<ApiResponse>('/admin/orders', { params }),
  getOrderDetail: (id: number) => api.get<ApiResponse>(`/admin/orders/${id}/detail`),
  updateOrderStatus: (id: number, status: string) =>
    api.put<ApiResponse>(`/admin/orders/${id}/status`, { status }),
  assignOrder: (id: number, agent_id: number) =>
    api.put<ApiResponse>(`/admin/orders/${id}/assign`, { agent_id }),
  reclaimOrder: (id: number) =>
    api.put<ApiResponse>(`/admin/orders/${id}/reclaim`),
  getAllUsers: (params?: any) => api.get<ApiResponse>('/admin/users', { params }),
  updateUserStatus: (id: number, status: number) =>
    api.put<ApiResponse>(`/admin/users/${id}/status`, { status }),
  getServiceConfig: () => api.get<ApiResponse>('/admin/services'),
  updateServiceConfig: (key: string, value: string) =>
    api.put<ApiResponse>('/admin/services', { key, value }),
  getFinanceStats: () => api.get<ApiResponse>('/admin/finance/stats'),
  getWithdrawals: (params?: any) => api.get<ApiResponse>('/admin/withdraw', { params }),
  updateWithdrawalStatus: (id: number, status: 'approved' | 'rejected') =>
    api.put<ApiResponse>(`/admin/withdraw/${id}/status`, { status })
}

export const superAdminApi = {
  login: (phone: string) =>
    api.post<ApiResponse>('/super-admin/login', { phone }),
  getStats: () => api.get<ApiResponse>('/super-admin/stats'),
  getAgents: (params?: any) => api.get<ApiResponse>('/super-admin/agents', { params }),
  createAgent: (data: any) => api.post<ApiResponse>('/super-admin/agents', data),
  updateAgent: (id: number, data: any) => api.put<ApiResponse>(`/super-admin/agents/${id}`, data),
  deleteAgent: (id: number) => api.delete<ApiResponse>(`/super-admin/agents/${id}`),
  getServices: () => api.get<ApiResponse>('/super-admin/services'),
  updateService: (key: string, value: string) =>
    api.put<ApiResponse>('/super-admin/services', { key, value }),
  getFinanceStats: () => api.get<ApiResponse>('/super-admin/finance/stats'),
  getPlatformIncome: (params?: any) => api.get<ApiResponse>('/super-admin/platform-income', { params }),
  getPlatformWithdrawals: (params?: any) => api.get<ApiResponse>('/super-admin/platform-withdrawals', { params }),
  platformWithdraw: (data: any) => api.post<ApiResponse>('/super-admin/platform-withdraw', data),
  getAgentWithdrawals: (params?: any) => api.get<ApiResponse>('/super-admin/agent-withdrawals', { params }),
  processAgentWithdrawal: (id: number, status: 'approved' | 'rejected', remark?: string) =>
    api.put<ApiResponse>(`/super-admin/agent-withdrawals/${id}/status`, { status, remark }),
  // 待确认收款的订单
  getPendingConfirmOrders: () => api.get<ApiResponse>('/super-admin/orders/pending-confirm'),
  confirmPayment: (orderId: number) =>
    api.put<ApiResponse>(`/super-admin/orders/${orderId}/confirm-payment`),
  // 上传收款码图片
  uploadQrcode: (image: string, type: 'alipay' | 'wechat') =>
    api.post<ApiResponse>('/super-admin/upload-qrcode', { image, type }),
  // 支付流水
  getPaymentRecords: (params?: any) => api.get<ApiResponse>('/super-admin/payment-records', { params })
}

export const agentApi = {
  login: (username: string) =>
    api.post<ApiResponse>('/agent/login', { username }),
  getOrders: (params?: any) => api.get<ApiResponse>('/agent/orders', { params }),
  getOrderPool: (params?: any) => api.get<ApiResponse>('/agent/orders/pool', { params }),
  getOrderDetail: (id: number) => api.get<ApiResponse>(`/agent/orders/${id}`),
  acceptOrder: (id: number) => api.put<ApiResponse>(`/agent/orders/${id}/accept`),
  processOrder: (id: number) => api.put<ApiResponse>(`/agent/orders/${id}/process`),
  completeOrder: (id: number, data: any) => api.put<ApiResponse>(`/agent/orders/${id}/complete`, data),
  getStats: () => api.get<ApiResponse>('/agent/stats'),
  getProfile: () => api.get<ApiResponse>('/agent/profile'),
  updatePassword: (data: { old_password: string; new_password: string }) =>
    api.put<ApiResponse>('/agent/password', data),
  getBalanceLogs: (params?: any) => api.get<ApiResponse>('/agent/balance/logs', { params }),
  withdraw: (data: any) => api.post<ApiResponse>('/agent/withdraw', data),
  getWithdrawals: (params?: any) => api.get<ApiResponse>('/agent/withdrawals', { params })
}

export default api
