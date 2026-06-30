export interface User {
  id: number
  phone: string
  nickname?: string
  avatar?: string
  balance: number
  role: 'user' | 'admin' | 'super_admin'
  status: number
  created_at: string
}

export interface Agent {
  id: number
  username: string
  name: string
  phone: string
  avatar?: string
  services: string[]
  status: number
  total_orders: number
  total_income: number
  created_at: string
}

export interface OrderLog {
  id: number
  order_id: number
  operator_type: 'user' | 'admin' | 'super_admin' | 'agent'
  operator_id: number
  action: string
  remark: string
  created_at: string
  operator_name?: string
}

export interface Address {
  id: number
  user_id: number
  name: string
  phone: string
  location: string
  detail: string
  is_default: number
  created_at: string
}

export interface Order {
  id: number
  order_no: string
  user_id: number
  type: 'print' | 'course' | 'express' | 'handwriting'
  total_amount: number
  status: 'pending' | 'paid' | 'assigned' | 'processing' | 'completed' | 'cancelled'
  address_id?: number
  pickup_time?: string
  paid_at?: string
  completed_at?: string
  created_at: string
  agent_id?: number
  assigned_at?: string
  accepted_at?: string
  proof_images?: string[]
  completion_remark?: string
  items?: OrderItem[]
  address?: Address
  user?: { id: number; phone: string; nickname?: string }
  agent?: { id: number; name: string; username: string }
  logs?: OrderLog[]
  print_name?: string
  print_phone?: string
  print_delivery_address?: string
  express_size?: string
  express_pickup_code?: string
  express_name?: string
  express_phone?: string
  express_delivery_address?: string
  express_remark?: string
  hw_service_type?: string
  hw_word_count?: number
  hw_font?: string
  hw_paper?: string
  hw_content?: string
  hw_remark?: string
}

export interface OrderItem {
  id: number
  order_id: number
  file_url?: string
  print_type?: 'black' | 'color'
  pages?: number
  sides?: 'single' | 'double'
  copies?: number
  binding?: 'none' | 'staple' | 'spiral'
  platform?: string
  course_name?: string
  course_url?: string
  course_account?: string
  course_password?: string
  urgent?: number
}

export interface Transaction {
  id: number
  user_id: number
  order_id?: number
  type: 'recharge' | 'withdraw' | 'consume' | 'refund'
  amount: number
  balance_before: number
  balance_after: number
  status: 'pending' | 'completed' | 'failed'
  remark?: string
  created_at: string
}

export interface Withdrawal {
  id: number
  user_id: number
  amount: number
  account: string
  account_type: 'alipay' | 'wechat'
  status: 'pending' | 'approved' | 'rejected'
  processed_at?: string
  created_at: string
}

export interface ServiceConfig {
  id: number
  key_name: string
  value: string
  description?: string
}

export interface ApiResponse<T = any> {
  code: number
  message?: string
  data?: T
}

export interface PrintFormData {
  file_url: string
  file_name: string
  print_type: 'black' | 'color'
  pages: number
  sides: 'single' | 'double'
  copies: number
  binding: 'none' | 'staple' | 'spiral'
}

export interface CourseFormData {
  platform: string
  course_name: string
  course_url: string
  account: string
  password: string
  urgent: boolean
}
