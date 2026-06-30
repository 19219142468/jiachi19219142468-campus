import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import net from 'net'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../data')
const UPLOAD_DIR = path.join(__dirname, '../uploads')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const orderTypeLabels = {
  print: '文件打印',
  course: '课业时长整理服务',
  express: '校内包裹配送服务',
  handwriting: '文案代写'
}

const COMMISSION_RATE = 0.9
const PLATFORM_FEE_RATE = 0.1

const ALIPAY_CONFIG = {
  enabled: false,
  appId: 'your_alipay_app_id',
  privateKey: 'your_private_key',
  publicKey: 'your_public_key',
  notifyUrl: '',
  gateway: 'https://openapi.alipay.com/gateway.do'
}

const PAY_VERIFY_CONFIG = {
  timeoutMinutes: 30,
  pollIntervalSeconds: 5,
  autoVerifyForTypes: ['print', 'express', 'handwriting'],
  manualVerifyForTypes: ['course']
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function loadData(name) {
  const file = path.join(DATA_DIR, `${name}.json`)
  if (!fs.existsSync(file)) return []
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return []
  }
}

function saveData(name, data) {
  const file = path.join(DATA_DIR, `${name}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function initData() {
  const users = loadData('users')
  if (!users.find(u => u.role === 'super_admin')) {
    const hashedPassword = bcrypt.hashSync('superadmin123', 10)
    users.push({
      id: 1,
      phone: '13800138000',
      password: hashedPassword,
      nickname: '超级管理员',
      avatar: '',
      balance: 0,
      role: 'super_admin',
      status: 1,
      created_at: new Date().toISOString()
    })
    saveData('users', users)
  }
  if (!users.find(u => u.role === 'admin')) {
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    users.push({
      id: 2,
      phone: '13800138000',
      password: hashedPassword,
      nickname: '管理员',
      avatar: '',
      balance: 0,
      role: 'admin',
      status: 1,
      created_at: new Date().toISOString()
    })
    saveData('users', users)
  }

  const configs = loadData('configs')
  if (configs.length === 0) {
    const defaultConfigs = [
      { key_name: 'black_print_price', value: '0.3', description: '黑白打印单价' },
      { key_name: 'color_print_price', value: '0.5', description: '彩色打印单价' },
      { key_name: 'course_base_price', value: '1.7', description: '课业时长整理服务基础价格' },
      { key_name: 'course_urgent_price', value: '1', description: '课业时长整理服务加急费' },
      { key_name: 'express_small_price', value: '0.1', description: '快递小件基础价' },
      { key_name: 'express_large_price', value: '2.5', description: '快递大件基础价' },
      { key_name: 'express_small_urgent', value: '0.8', description: '快递小件加急费' },
      { key_name: 'express_large_urgent', value: '1.5', description: '快递大件加急费' },
      { key_name: 'handwriting_price', value: '1.5', description: '写字服务每百字价格' },
      { key_name: 'handwriting_urgent_rate', value: '0.05', description: '写字服务加急费率' },
      { key_name: 'payment_mode', value: 'manual', description: '收款模式' },
      { key_name: 'withdraw_min_amount', value: '10', description: '最低提现金额' },
      { key_name: 'alipay_qrcode', value: '', description: '支付宝收款码URL' },
      { key_name: 'wechat_qrcode', value: '', description: '微信收款码URL' },
      { key_name: 'admin_alipay', value: '', description: '管理员支付宝账号' },
      { key_name: 'admin_wechat', value: '', description: '管理员微信账号' }
    ]
    saveData('configs', defaultConfigs)
  }

  const agents = loadData('agents')
  if (agents.length === 0) {
    const hashedPassword = bcrypt.hashSync('agent123', 10)
    agents.push({
      id: 1,
      username: 'agent001',
      password: hashedPassword,
      name: '张师傅',
      phone: '13700137001',
      avatar: '',
      services: ['print', 'course', 'express', 'handwriting'],
      status: 1,
      total_orders: 0,
      total_income: 0,
      balance: 0,
      created_at: new Date().toISOString()
    })
    saveData('agents', agents)
  }
}

initData()

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// 静态文件服务 - 上传的图片
app.use('/uploads', express.static(UPLOAD_DIR))

const JWT_SECRET = 'campus-service-secret-2024'

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' })
  }
}

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ code: 401, message: '未登录' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const users = loadData('users')
    const user = users.find(u => u.id === decoded.userId)
    if (user?.role !== 'admin' && user?.role !== 'super_admin') return res.status(403).json({ code: 403, message: '无权限' })
    req.userId = decoded.userId
    req.userRole = user.role
    next()
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' })
  }
}

function superAdminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ code: 401, message: '未登录' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const users = loadData('users')
    const user = users.find(u => u.id === decoded.userId)
    if (user?.role !== 'super_admin') return res.status(403).json({ code: 403, message: '无权限' })
    req.userId = decoded.userId
    req.userRole = 'super_admin'
    next()
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' })
  }
}

function agentAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ code: 401, message: '未登录' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'agent') return res.status(403).json({ code: 403, message: '无权限' })
    const agents = loadData('agents')
    const agent = agents.find(a => a.id === decoded.agentId)
    if (!agent || agent.status !== 1) return res.status(403).json({ code: 403, message: '账号已被禁用' })
    req.agentId = decoded.agentId
    req.agent = agent
    next()
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' })
  }
}

function addOrderLog(orderId, operatorType, operatorId, action, remark) {
  const logs = loadData('order_logs')
  logs.push({
    id: getNextId(logs),
    order_id: orderId,
    operator_type: operatorType,
    operator_id: operatorId,
    action,
    remark: remark || '',
    created_at: new Date().toISOString()
  })
  saveData('order_logs', logs)
}

function generateOrderNo() {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
}

function notifyUser(userId, message) {
  wss.clients.forEach(client => {
    if (client.userId === userId && client.readyState === 1) {
      client.send(JSON.stringify(message))
    }
  })
}

function getNextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const { token } = JSON.parse(data)
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET)
        ws.userId = decoded.userId
      }
    } catch {}
  })
})

app.post('/api/auth/sendCode', (req, res) => {
  const { phone } = req.body
  if (!phone || phone.length !== 11) {
    return res.json({ code: 400, message: '请输入正确的手机号' })
  }
  const code = Math.random().toString().slice(2, 8)
  console.log(`验证码 ${code} 已发送至 ${phone}`)
  res.json({ code: 0, message: '发送成功' })
})

app.post('/api/auth/register', (req, res) => {
  const { phone, code, password } = req.body
  const users = loadData('users')
  
  if (users.find(u => u.phone === phone)) {
    return res.json({ code: 400, message: '该手机号已注册' })
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  const newUser = {
    id: getNextId(users),
    phone,
    password: hashedPassword,
    nickname: '',
    avatar: '',
    balance: 0,
    role: 'user',
    status: 1,
    created_at: new Date().toISOString()
  }
  users.push(newUser)
  saveData('users', users)
  
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...userInfo } = newUser
  res.json({ code: 0, data: { token, user: userInfo } })
})

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body
  const users = loadData('users')
  let user = users.find(u => u.phone === phone)
  
  if (!user) {
    return res.json({ code: 400, message: '该手机号未注册，请先完成下单后用订单手机号登录' })
  }
  
  if (password && user.password) {
    if (!bcrypt.compareSync(password, user.password)) {
      return res.json({ code: 400, message: '手机号或密码错误' })
    }
  }
  
  if (user.status === 0) {
    return res.json({ code: 400, message: '账号已被禁用' })
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...userInfo } = user
  res.json({ code: 0, data: { token, user: userInfo } })
})

app.get('/api/auth/userinfo', authMiddleware, (req, res) => {
  const users = loadData('users')
  const user = users.find(u => u.id === req.userId)
  if (!user) return res.json({ code: 404, message: '用户不存在' })
  const { password: _, ...userInfo } = user
  res.json({ code: 0, data: userInfo })
})

app.get('/api/user/profile', authMiddleware, (req, res) => {
  const users = loadData('users')
  const user = users.find(u => u.id === req.userId)
  if (!user) return res.json({ code: 404, message: '用户不存在' })
  const { password: _, ...userInfo } = user
  res.json({ code: 0, data: userInfo })
})

app.put('/api/user/profile', authMiddleware, (req, res) => {
  const { nickname } = req.body
  const users = loadData('users')
  const idx = users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.json({ code: 404, message: '用户不存在' })
  users[idx].nickname = nickname
  saveData('users', users)
  res.json({ code: 0, message: '更新成功' })
})

app.get('/api/user/addresses', authMiddleware, (req, res) => {
  const addresses = loadData('addresses').filter(a => a.user_id === req.userId)
  res.json({ code: 0, data: addresses })
})

app.post('/api/user/addresses', authMiddleware, (req, res) => {
  const { name, phone, location, detail, is_default } = req.body
  const addresses = loadData('addresses')
  
  if (is_default) {
    addresses.forEach(a => {
      if (a.user_id === req.userId) a.is_default = 0
    })
  }
  
  const newAddr = {
    id: getNextId(addresses),
    user_id: req.userId,
    name,
    phone,
    location,
    detail: detail || '',
    is_default: is_default ? 1 : 0,
    created_at: new Date().toISOString()
  }
  addresses.push(newAddr)
  saveData('addresses', addresses)
  res.json({ code: 0, data: newAddr })
})

app.put('/api/user/addresses/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { name, phone, location, detail, is_default } = req.body
  const addresses = loadData('addresses')
  const idx = addresses.findIndex(a => a.id === Number(id) && a.user_id === req.userId)
  
  if (idx === -1) return res.json({ code: 404, message: '地址不存在' })
  
  if (is_default) {
    addresses.forEach(a => {
      if (a.user_id === req.userId) a.is_default = 0
    })
  }
  
  addresses[idx] = { ...addresses[idx], name, phone, location, detail, is_default: is_default ? 1 : 0 }
  saveData('addresses', addresses)
  res.json({ code: 0, message: '更新成功' })
})

app.delete('/api/user/addresses/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  let addresses = loadData('addresses')
  addresses = addresses.filter(a => !(a.id === Number(id) && a.user_id === req.userId))
  saveData('addresses', addresses)
  res.json({ code: 0, message: '删除成功' })
})

app.post('/api/orders/print', authMiddleware, (req, res) => {
  const { items, name, phone, delivery_address, pay_method } = req.body
  const configs = loadData('configs')
  const blackPrice = parseFloat(configs.find(c => c.key_name === 'black_print_price')?.value || '0.3')
  const colorPrice = parseFloat(configs.find(c => c.key_name === 'color_print_price')?.value || '0.5')
  
  let totalAmount = 0
  items.forEach(item => {
    const unitPrice = item.print_type === 'black' ? blackPrice : colorPrice
    const pages = item.pages || 1
    const copies = item.copies || 1
    const bindingPrice = item.binding === 'staple' ? 0.5 : 0
    totalAmount += (unitPrice * pages + bindingPrice) * copies
  })
  
  const orders = loadData('orders')
  const orderItems = loadData('order_items')
  const orderNo = generateOrderNo()
  
  const newOrder = {
    id: getNextId(orders),
    order_no: orderNo,
    user_id: req.userId,
    type: 'print',
    total_amount: parseFloat(totalAmount.toFixed(2)),
    status: 'pending',
    address_id: null,
    pickup_time: null,
    pay_method: pay_method || 'alipay',
    print_name: name || '',
    print_phone: phone || '',
    print_delivery_address: delivery_address || '',
    paid_at: null,
    completed_at: null,
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  saveData('orders', orders)
  
  items.forEach(item => {
    const newItem = {
      id: getNextId(orderItems),
      order_id: newOrder.id,
      file_url: item.file_url || '',
      file_name: item.file_name || '',
      print_type: item.print_type || 'black',
      pages: item.pages || 1,
      sides: item.sides || 'single',
      copies: item.copies || 1,
      binding: item.binding || 'none',
      platform: null,
      course_name: null,
      course_url: null,
      course_account: null,
      course_password: null,
      urgent: 0
    }
    orderItems.push(newItem)
  })
  saveData('order_items', orderItems)
  
  res.json({ code: 0, data: { id: newOrder.id, order_no: orderNo, total_amount: newOrder.total_amount } })
})

app.post('/api/orders/course', authMiddleware, (req, res) => {
  const { platform, course_name, account, password, urgent } = req.body
  const configs = loadData('configs')
  const basePrice = parseFloat(configs.find(c => c.key_name === 'course_base_price')?.value || '1.7')
  const urgentPrice = parseFloat(configs.find(c => c.key_name === 'course_urgent_price')?.value || '1')
  
  const totalAmount = basePrice + (urgent ? urgentPrice : 0)
  const orders = loadData('orders')
  const orderItems = loadData('order_items')
  const orderNo = generateOrderNo()
  
  const newOrder = {
    id: getNextId(orders),
    order_no: orderNo,
    user_id: req.userId,
    type: 'course',
    total_amount: totalAmount,
    status: 'pending',
    address_id: null,
    pickup_time: null,
    paid_at: null,
    completed_at: null,
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  saveData('orders', orders)
  
  const encryptedPassword = bcrypt.hashSync(password, 10)
  const newItem = {
    id: getNextId(orderItems),
    order_id: newOrder.id,
    file_url: null,
    file_name: null,
    print_type: null,
    pages: 0,
    sides: null,
    copies: 0,
    binding: null,
    platform,
    course_name,
    course_account: account,
    course_password: encryptedPassword,
    urgent: urgent ? 1 : 0
  }
  orderItems.push(newItem)
  saveData('order_items', orderItems)
  
  res.json({ code: 0, data: { id: newOrder.id, order_no: orderNo, total_amount: totalAmount } })
})

app.post('/api/orders/express', authMiddleware, (req, res) => {
  const { size, pickup_code, name, phone, delivery_address, urgent, remark } = req.body

  const configs = loadData('configs')
  const smallPrice = parseFloat(configs.find(c => c.key_name === 'express_small_price')?.value || '0.1')
  const largePrice = parseFloat(configs.find(c => c.key_name === 'express_large_price')?.value || '2.5')
  const smallUrgent = parseFloat(configs.find(c => c.key_name === 'express_small_urgent')?.value || '0.8')
  const largeUrgent = parseFloat(configs.find(c => c.key_name === 'express_large_urgent')?.value || '1.5')

  const basePrice = size === 'large' ? largePrice : smallPrice
  const urgentPrice = urgent ? (size === 'large' ? largeUrgent : smallUrgent) : 0
  const totalAmount = parseFloat((basePrice + urgentPrice).toFixed(2))

  const orders = loadData('orders')
  const orderItems = loadData('order_items')
  const orderNo = generateOrderNo()

  const newOrder = {
    id: getNextId(orders),
    order_no: orderNo,
    user_id: req.userId,
    type: 'express',
    total_amount: totalAmount,
    status: 'pending',
    address_id: null,
    pickup_time: null,
    paid_at: null,
    completed_at: null,
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  saveData('orders', orders)

  const newItem = {
    id: getNextId(orderItems),
    order_id: newOrder.id,
    file_url: null,
    file_name: null,
    print_type: null,
    pages: 0,
    sides: null,
    copies: 0,
    binding: null,
    platform: null,
    course_name: null,
    course_url: null,
    course_account: null,
    course_password: null,
    urgent: urgent ? 1 : 0,
    express_size: size,
    express_pickup_code: pickup_code,
    express_name: name || '',
    express_phone: phone || '',
    express_delivery_address: delivery_address || '',
    express_remark: remark || ''
  }
  orderItems.push(newItem)
  saveData('order_items', orderItems)

  res.json({ code: 0, data: { id: newOrder.id, order_no: orderNo, total_amount: totalAmount } })
})

app.post('/api/orders/handwriting', authMiddleware, (req, res) => {
  const { service_type, word_count, font, paper, content, urgent, remark } = req.body

  const pricePer100 = 1.5
  const hundreds = Math.ceil(word_count / 100)
  let totalAmount = hundreds * pricePer100
  if (urgent) {
    totalAmount = parseFloat((totalAmount * 1.05).toFixed(2))
  }

  const orders = loadData('orders')
  const orderItems = loadData('order_items')
  const orderNo = generateOrderNo()

  const newOrder = {
    id: getNextId(orders),
    order_no: orderNo,
    user_id: req.userId,
    type: 'handwriting',
    total_amount: totalAmount,
    status: 'pending',
    address_id: null,
    pickup_time: null,
    paid_at: null,
    completed_at: null,
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  saveData('orders', orders)

  const newItem = {
    id: getNextId(orderItems),
    order_id: newOrder.id,
    file_url: null,
    file_name: null,
    print_type: null,
    pages: 0,
    sides: null,
    copies: 0,
    binding: null,
    platform: null,
    course_name: null,
    course_url: null,
    course_account: null,
    course_password: null,
    urgent: urgent ? 1 : 0,
    hw_service_type: service_type,
    hw_word_count: word_count,
    hw_font: font,
    hw_paper: paper,
    hw_content: content,
    hw_remark: remark || ''
  }
  orderItems.push(newItem)
  saveData('order_items', orderItems)

  res.json({ code: 0, data: { id: newOrder.id, order_no: orderNo, total_amount: totalAmount } })
})

// 通过手机号查询订单（公开接口，无需登录）
app.get('/api/orders/public', (req, res) => {
  const { status, page = 1, limit = 10, phone } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  if (!phone || !/^1\d{10}$/.test(phone)) {
    return res.json({ code: 400, message: '请提供有效的手机号' })
  }
  
  const users = loadData('users')
  const user = users.find(u => u.phone === phone)
  if (!user) {
    return res.json({ code: 0, data: { list: [], total: 0 } })
  }
  
  let orders = loadData('orders').filter(o => o.user_id === user.id)
  
  if (status) {
    orders = orders.filter(o => o.status === status)
  }
  
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.get('/api/orders', authMiddleware, (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let orders = loadData('orders').filter(o => o.user_id === req.userId)
  
  if (status) {
    orders = orders.filter(o => o.status === status)
  }
  
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const order = orders.find(o => o.id === Number(id) && o.user_id === req.userId)
  
  if (!order) return res.json({ code: 404, message: '订单不存在' })
  
  const orderItems = loadData('order_items').filter(i => i.order_id === order.id)
  const addresses = loadData('addresses')
  const address = order.address_id ? addresses.find(a => a.id === order.address_id) : null
  
  res.json({ code: 0, data: { ...order, items: orderItems, address } })
})

// 通过手机号查询订单详情
app.get('/api/orders/phone/:id', (req, res) => {
  const { id } = req.params
  const phone = req.query.phone
  
  if (!phone || !/^1\d{10}$/.test(phone)) {
    return res.json({ code: 400, message: '请提供有效的手机号' })
  }
  
  const users = loadData('users')
  const user = users.find(u => u.phone === phone)
  if (!user) {
    return res.json({ code: 404, message: '未找到该手机号对应的用户' })
  }
  
  const orders = loadData('orders')
  const order = orders.find(o => o.id === Number(id) && o.user_id === user.id)
  
  if (!order) return res.json({ code: 404, message: '订单不存在' })
  
  const orderItems = loadData('order_items').filter(i => i.order_id === order.id)
  const addresses = loadData('addresses')
  const address = order.address_id ? addresses.find(a => a.id === order.address_id) : null
  
  res.json({ code: 0, data: { ...order, items: orderItems, address } })
})

app.put('/api/orders/:id/cancel', authMiddleware, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id) && o.user_id === req.userId)
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  if (orders[idx].status !== 'pending') return res.json({ code: 400, message: '该订单无法取消' })
  
  orders[idx].status = 'cancelled'
  saveData('orders', orders)
  res.json({ code: 0, message: '取消成功' })
})

// 用户提交转账凭证（标记待确认）
app.put('/api/orders/:id/confirm-transfer', authMiddleware, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id) && o.user_id === req.userId)
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  if (orders[idx].status !== 'pending') return res.json({ code: 400, message: '订单状态不正确' })
  
  orders[idx].status = 'pending_confirm'
  orders[idx].transfer_submitted_at = new Date().toISOString()
  orders[idx].verify_attempts = 0
  saveData('orders', orders)
  
  addOrderLog(Number(id), 'user', req.userId, 'transfer_submitted', '用户提交转账，等待自动核验')
  
  res.json({ 
    code: 0, 
    message: '已提交，系统正在自动核验付款状态',
    data: {
      autoVerify: PAY_VERIFY_CONFIG.autoVerifyForTypes.includes(orders[idx].type),
      timeoutMinutes: PAY_VERIFY_CONFIG.timeoutMinutes
    }
  })
})

// 查询支付核验状态
app.get('/api/pay/verify/:orderId', authMiddleware, async (req, res) => {
  const { orderId } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(orderId) && o.user_id === req.userId)
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  
  const order = orders[idx]
  
  if (order.status === 'paid') {
    return res.json({ 
      code: 0, 
      data: { 
        status: 'paid', 
        paid_at: order.paid_at,
        amount: order.total_amount
      } 
    })
  }
  
  if (order.status === 'cancelled') {
    return res.json({ 
      code: 0, 
      data: { 
        status: 'cancelled',
        reason: 'timeout'
      } 
    })
  }
  
  if (order.status !== 'pending_confirm') {
    return res.json({ code: 0, data: { status: order.status } })
  }
  
  const submittedAt = new Date(order.transfer_submitted_at)
  const now = new Date()
  const diffMinutes = (now - submittedAt) / 60000
  
  if (diffMinutes >= PAY_VERIFY_CONFIG.timeoutMinutes) {
    orders[idx].status = 'cancelled'
    orders[idx].cancelled_at = now.toISOString()
    orders[idx].cancel_reason = 'payment_timeout'
    saveData('orders', orders)
    addOrderLog(Number(orderId), 'system', 0, 'cancel_timeout', '支付超时自动取消')
    return res.json({ 
      code: 0, 
      data: { 
        status: 'cancelled',
        reason: 'timeout'
      } 
    })
  }
  
  const isAutoVerifyType = PAY_VERIFY_CONFIG.autoVerifyForTypes.includes(order.type)
  
  if (!isAutoVerifyType) {
    return res.json({ 
      code: 0, 
      data: { 
        status: 'pending_confirm',
        autoVerify: false,
        message: '该服务需管理员手动确认'
      } 
    })
  }
  
  orders[idx].verify_attempts = (orders[idx].verify_attempts || 0) + 1
  saveData('orders', orders)
  
  const verifyResult = await verifyAlipayPayment(order.order_no, order.total_amount)
  
  if (verifyResult.success) {
    orders[idx].status = 'paid'
    orders[idx].paid_at = now.toISOString()
    orders[idx].pay_method = 'alipay'
    orders[idx].pay_trade_no = verifyResult.tradeNo
    saveData('orders', orders)
    
    const paymentRecords = loadData('payment_records')
    paymentRecords.push({
      id: getNextId(paymentRecords),
      order_id: order.id,
      order_no: order.order_no,
      order_type: order.type,
      user_id: order.user_id,
      amount: order.total_amount,
      pay_method: 'alipay',
      trade_no: verifyResult.tradeNo,
      status: 'success',
      verify_type: 'auto',
      created_at: now.toISOString()
    })
    saveData('payment_records', paymentRecords)
    
    addOrderLog(Number(orderId), 'system', 0, 'auto_verify_success', '自动核验付款成功')
    
    notifyUser(order.user_id, { type: 'order_paid', order_id: order.id })
    
    return res.json({ 
      code: 0, 
      data: { 
        status: 'paid', 
        paid_at: orders[idx].paid_at,
        amount: order.total_amount,
        trade_no: verifyResult.tradeNo
      } 
    })
  }
  
  return res.json({ 
    code: 0, 
    data: { 
      status: 'pending_confirm',
      autoVerify: true,
      verifyAttempts: orders[idx].verify_attempts,
      remainingMinutes: Math.ceil(PAY_VERIFY_CONFIG.timeoutMinutes - diffMinutes),
      message: '正在核验中...'
    } 
  })
})

async function verifyAlipayPayment(orderNo, expectedAmount) {
  if (!ALIPAY_CONFIG.enabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() < 0.1
        if (success) {
          resolve({
            success: true,
            tradeNo: '2024' + Date.now() + Math.random().toString().slice(2, 10),
            amount: expectedAmount,
            payTime: new Date().toISOString()
          })
        } else {
          resolve({ success: false })
        }
      }, 500)
    })
  }
  
  try {
    const alipaySdk = new AlipaySdk({
      appId: ALIPAY_CONFIG.appId,
      privateKey: ALIPAY_CONFIG.privateKey,
      alipayPublicKey: ALIPAY_CONFIG.publicKey,
      gateway: ALIPAY_CONFIG.gateway
    })
    
    const result = await alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderNo
      }
    })
    
    if (result.code === '10000' && result.tradeStatus === 'TRADE_SUCCESS') {
      const actualAmount = parseFloat(result.totalAmount)
      if (Math.abs(actualAmount - expectedAmount) < 0.01) {
        return {
          success: true,
          tradeNo: result.tradeNo,
          amount: actualAmount,
          payTime: result.sendPayDate
        }
      }
    }
    
    return { success: false }
  } catch (error) {
    console.error('支付宝查询失败', error)
    return { success: false, error: error.message }
  }
}

app.post('/api/pay/create', authMiddleware, (req, res) => {
  const { order_id } = req.body
  const orders = loadData('orders')
  const order = orders.find(o => o.id === Number(order_id) && o.user_id === req.userId)
  
  if (!order) return res.json({ code: 404, message: '订单不存在' })
  if (order.status !== 'pending') return res.json({ code: 400, message: '该订单已支付' })
  
  res.json({ code: 0, data: { pay_url: '/mock-pay', qr_code: 'mock' } })
})

app.get('/api/pay/status/:orderId', authMiddleware, (req, res) => {
  const orders = loadData('orders')
  const order = orders.find(o => o.id === Number(req.params.orderId))
  res.json({ code: 0, data: { status: order?.status } })
})

app.get('/api/pay/result/:orderId', authMiddleware, (req, res) => {
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(req.params.orderId) && o.user_id === req.userId)
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  
  if (orders[idx].status === 'pending') {
    orders[idx].status = 'paid'
    orders[idx].paid_at = new Date().toISOString()
    saveData('orders', orders)
    notifyUser(req.userId, { type: 'order_paid', order_id: req.params.orderId })
    
    const transactions = loadData('transactions')
    const users = loadData('users')
    const userIdx = users.findIndex(u => u.id === req.userId)
    
    if (orders[idx].type === 'recharge') {
      if (userIdx !== -1) {
        const before = users[userIdx].balance
        users[userIdx].balance = parseFloat((before + orders[idx].total_amount).toFixed(2))
        saveData('users', users)
        
        transactions.push({
          id: getNextId(transactions),
          user_id: req.userId,
          order_id: orders[idx].id,
          type: 'recharge',
          amount: orders[idx].total_amount,
          balance_before: before,
          balance_after: users[userIdx].balance,
          status: 'completed',
          remark: '余额充值',
          created_at: new Date().toISOString()
        })
        saveData('transactions', transactions)
      }
    }
  }
  
  res.json({ code: 0, data: { status: 'paid' } })
})

app.get('/api/finance/balance', authMiddleware, (req, res) => {
  const users = loadData('users')
  const user = users.find(u => u.id === req.userId)
  const transactions = loadData('transactions').filter(t => t.user_id === req.userId)
  const today = new Date().toDateString()
  const todayIncome = transactions
    .filter(t => t.type === 'recharge' && new Date(t.created_at).toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0)
  
  res.json({ code: 0, data: { balance: user?.balance || 0, today_income: todayIncome } })
})

app.post('/api/finance/recharge', authMiddleware, (req, res) => {
  const { amount } = req.body
  const orders = loadData('orders')
  const orderNo = generateOrderNo()
  
  const newOrder = {
    id: getNextId(orders),
    order_no: orderNo,
    user_id: req.userId,
    type: 'recharge',
    total_amount: parseFloat(amount),
    status: 'pending',
    address_id: null,
    pickup_time: null,
    paid_at: null,
    completed_at: null,
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  saveData('orders', orders)
  
  res.json({ code: 0, data: { order_id: newOrder.id } })
})

app.post('/api/finance/withdraw', authMiddleware, (req, res) => {
  const { amount, account, type } = req.body
  const users = loadData('users')
  const user = users.find(u => u.id === req.userId)
  
  if (!user || user.balance < parseFloat(amount)) {
    return res.json({ code: 400, message: '余额不足' })
  }
  
  const withdrawals = loadData('withdrawals')
  const newWithdrawal = {
    id: getNextId(withdrawals),
    user_id: req.userId,
    amount: parseFloat(amount),
    account,
    account_type: type,
    status: 'pending',
    processed_at: null,
    created_at: new Date().toISOString()
  }
  withdrawals.push(newWithdrawal)
  saveData('withdrawals', withdrawals)
  
  res.json({ code: 0, message: '提现申请已提交' })
})

app.get('/api/finance/records', authMiddleware, (req, res) => {
  const records = loadData('transactions')
    .filter(t => t.user_id === req.userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50)
  
  res.json({ code: 0, data: records })
})

app.get('/api/admin/stats', adminAuth, (req, res) => {
  const orders = loadData('orders')
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const todayIncome = todayOrders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)
  const printOrders = orders.filter(o => o.type === 'print').length
  const courseOrders = orders.filter(o => o.type === 'course').length
  const expressOrders = orders.filter(o => o.type === 'express').length
  const handwritingOrders = orders.filter(o => o.type === 'handwriting').length
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
  
  res.json({
    code: 0,
    data: {
      stats: {
        todayOrders: todayOrders.length,
        todayIncome: parseFloat(todayIncome.toFixed(2)),
        printOrders,
        courseOrders,
        expressOrders,
        handwritingOrders
      },
      recentOrders
    }
  })
})

app.get('/api/admin/orders', adminAuth, (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  let orders = loadData('orders')
  
  if (status) orders = orders.filter(o => o.status === status)
  if (type) orders = orders.filter(o => o.type === type)
  
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.put('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  
  orders[idx].status = status
  if (status === 'completed') {
    orders[idx].completed_at = new Date().toISOString()
  }
  saveData('orders', orders)
  
  notifyUser(orders[idx].user_id, { type: 'order_status_changed', order_id: id, status })
  res.json({ code: 0, message: '更新成功' })
})

app.get('/api/admin/users', adminAuth, (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  let users = loadData('users')
    .map(({ password, ...u }) => u)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const total = users.length
  const list = users.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.put('/api/admin/users/:id/status', adminAuth, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const users = loadData('users')
  const idx = users.findIndex(u => u.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '用户不存在' })
  
  users[idx].status = status
  saveData('users', users)
  res.json({ code: 0, message: '更新成功' })
})

app.get('/api/admin/services', adminAuth, (req, res) => {
  const configs = loadData('configs')
  res.json({ code: 0, data: configs })
})

app.put('/api/admin/services', adminAuth, (req, res) => {
  const { key, value } = req.body
  const configs = loadData('configs')
  const idx = configs.findIndex(c => c.key_name === key)
  
  if (idx === -1) return res.json({ code: 404, message: '配置不存在' })
  
  configs[idx].value = value
  saveData('configs', configs)
  res.json({ code: 0, message: '更新成功' })
})

app.get('/api/admin/finance/stats', adminAuth, (req, res) => {
  const users = loadData('users')
  const totalBalance = users
    .filter(u => u.role === 'user')
    .reduce((sum, u) => sum + (u.balance || 0), 0)
  
  const records = loadData('transactions')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 50)
  
  res.json({ code: 0, data: { stats: { totalBalance: parseFloat(totalBalance.toFixed(2)) }, records } })
})

app.get('/api/admin/withdraw', adminAuth, (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  let withdrawals = loadData('withdrawals')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const total = withdrawals.length
  const list = withdrawals.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.put('/api/admin/withdraw/:id/status', adminAuth, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const withdrawals = loadData('withdrawals')
  const idx = withdrawals.findIndex(w => w.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '提现申请不存在' })
  
  if (status === 'approved') {
    const users = loadData('users')
    const userIdx = users.findIndex(u => u.id === withdrawals[idx].user_id)
    if (userIdx !== -1) {
      users[userIdx].balance = parseFloat((users[userIdx].balance - withdrawals[idx].amount).toFixed(2))
      if (users[userIdx].balance < 0) users[userIdx].balance = 0
      saveData('users', users)
    }
  }
  
  withdrawals[idx].status = status
  withdrawals[idx].processed_at = new Date().toISOString()
  saveData('withdrawals', withdrawals)
  
  res.json({ code: 0, message: '处理成功' })
})

// ========== 超级管理员登录 ==========
app.post('/api/super-admin/login', (req, res) => {
  const { phone } = req.body
  const users = loadData('users')
  const user = users.find(u => u.phone === phone && u.role === 'super_admin')
  
  if (!user) {
    return res.json({ code: 400, message: '账号不存在' })
  }
  if (user.status === 0) {
    return res.json({ code: 400, message: '账号已被禁用' })
  }
  
  const token = jwt.sign({ userId: user.id, role: 'super_admin' }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...userInfo } = user
  res.json({ code: 0, data: { token, user: userInfo } })
})

// ========== 业务员登录 ==========
app.post('/api/agent/login', (req, res) => {
  const { username } = req.body
  const agents = loadData('agents')
  const agent = agents.find(a => a.username === username)
  
  if (!agent) {
    return res.json({ code: 400, message: '账号不存在' })
  }
  if (agent.status === 0) {
    return res.json({ code: 400, message: '账号已被禁用' })
  }
  
  const token = jwt.sign({ agentId: agent.id, role: 'agent' }, JWT_SECRET, { expiresIn: '7d' })
  const { password: _, ...agentInfo } = agent
  res.json({ code: 0, data: { token, agent: agentInfo } })
})

// ========== 业务员管理（超级管理员） ==========
app.get('/api/super-admin/agents', superAdminAuth, (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  let agents = loadData('agents')
  
  if (status !== undefined) {
    agents = agents.filter(a => a.status === Number(status))
  }
  
  agents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = agents.length
  const list = agents.slice(offset, offset + Number(limit)).map(({ password, ...a }) => a)
  
  res.json({ code: 0, data: { list, total } })
})

app.post('/api/super-admin/agents', superAdminAuth, (req, res) => {
  const { username, password, name, phone, services } = req.body
  const agents = loadData('agents')
  
  if (agents.find(a => a.username === username)) {
    return res.json({ code: 400, message: '该用户名已存在' })
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  const newAgent = {
    id: getNextId(agents),
    username,
    password: hashedPassword,
    name: name || '',
    phone: phone || '',
    avatar: '',
    services: services || ['print', 'course', 'express', 'handwriting'],
    status: 1,
    total_orders: 0,
    total_income: 0,
    created_at: new Date().toISOString()
  }
  agents.push(newAgent)
  saveData('agents', agents)
  
  const { password: _, ...agentInfo } = newAgent
  res.json({ code: 0, data: agentInfo })
})

app.put('/api/super-admin/agents/:id', superAdminAuth, (req, res) => {
  const { id } = req.params
  const { name, phone, services, status, password } = req.body
  const agents = loadData('agents')
  const idx = agents.findIndex(a => a.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '业务员不存在' })
  
  if (name !== undefined) agents[idx].name = name
  if (phone !== undefined) agents[idx].phone = phone
  if (services !== undefined) agents[idx].services = services
  if (status !== undefined) agents[idx].status = status
  if (password) agents[idx].password = bcrypt.hashSync(password, 10)
  
  saveData('agents', agents)
  const { password: _, ...agentInfo } = agents[idx]
  res.json({ code: 0, data: agentInfo })
})

app.delete('/api/super-admin/agents/:id', superAdminAuth, (req, res) => {
  const { id } = req.params
  let agents = loadData('agents')
  const idx = agents.findIndex(a => a.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '业务员不存在' })
  
  agents = agents.filter(a => a.id !== Number(id))
  saveData('agents', agents)
  res.json({ code: 0, message: '删除成功' })
})

// ========== 超级管理员 - 业务员收入统计 ==========
app.get('/api/super-admin/agents/:id/stats', superAdminAuth, (req, res) => {
  const { id } = req.params
  const agents = loadData('agents')
  const agent = agents.find(a => a.id === Number(id))
  
  if (!agent) return res.json({ code: 404, message: '业务员不存在' })
  
  const orders = loadData('orders').filter(o => o.agent_id === Number(id))
  const today = new Date().toDateString()
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  const completedOrders = orders.filter(o => o.status === 'completed')
  
  const todayIncome = completedOrders
    .filter(o => new Date(o.completed_at).toDateString() === today)
    .reduce((sum, o) => sum + parseFloat((o.total_amount * COMMISSION_RATE).toFixed(2)), 0)
  
  const monthIncome = completedOrders
    .filter(o => {
      const d = new Date(o.completed_at)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((sum, o) => sum + parseFloat((o.total_amount * COMMISSION_RATE).toFixed(2)), 0)
  
  const totalIncome = completedOrders
    .reduce((sum, o) => sum + parseFloat((o.total_amount * COMMISSION_RATE).toFixed(2)), 0)
  
  const dailyStatsMap: Record<string, { date: string; income: number; orders: number }> = {}
  completedOrders.forEach(o => {
    const d = new Date(o.completed_at)
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const commission = parseFloat((o.total_amount * COMMISSION_RATE).toFixed(2))
    if (!dailyStatsMap[dateKey]) {
      dailyStatsMap[dateKey] = { date: dateKey, income: 0, orders: 0 }
    }
    dailyStatsMap[dateKey].income += commission
    dailyStatsMap[dateKey].orders += 1
  })
  
  const dailyStats = Object.values(dailyStatsMap)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30)
  
  const typeStats = {
    print: completedOrders.filter(o => o.type === 'print').length,
    course: completedOrders.filter(o => o.type === 'course').length,
    express: completedOrders.filter(o => o.type === 'express').length,
    handwriting: completedOrders.filter(o => o.type === 'handwriting').length
  }
  
  res.json({
    code: 0,
    data: {
      agent: { id: agent.id, name: agent.name, username: agent.username, phone: agent.phone },
      todayOrders: orders.filter(o => new Date(o.created_at).toDateString() === today).length,
      completedOrders: completedOrders.length,
      todayIncome: parseFloat(todayIncome.toFixed(2)),
      monthIncome: parseFloat(monthIncome.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      typeStats,
      dailyStats
    }
  })
})

// ========== 订单分配（管理员） ==========
app.get('/api/admin/orders/:id/detail', adminAuth, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const order = orders.find(o => o.id === Number(id))
  
  if (!order) return res.json({ code: 404, message: '订单不存在' })
  
  const orderItems = loadData('order_items').filter(i => i.order_id === order.id)
  const users = loadData('users')
  const user = users.find(u => u.id === order.user_id)
  const agents = loadData('agents')
  const agent = order.agent_id ? agents.find(a => a.id === order.agent_id) : null
  const logs = loadData('order_logs')
    .filter(l => l.order_id === order.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const userInfo = user ? { id: user.id, phone: user.phone, nickname: user.nickname } : null
  const agentInfo = agent ? { id: agent.id, name: agent.name, username: agent.username } : null
  const logsWithOperator = logs.map(log => {
    let operatorName = ''
    if (log.operator_type === 'user') {
      const u = users.find(x => x.id === log.operator_id)
      operatorName = u?.nickname || u?.phone || '用户'
    } else if (log.operator_type === 'agent') {
      const a = agents.find(x => x.id === log.operator_id)
      operatorName = a?.name || '业务员'
    } else if (log.operator_type === 'admin' || log.operator_type === 'super_admin') {
      const u = users.find(x => x.id === log.operator_id)
      operatorName = u?.nickname || '管理员'
    }
    return { ...log, operator_name: operatorName }
  })
  
  res.json({ code: 0, data: { ...order, items: orderItems, user: userInfo, agent: agentInfo, logs: logsWithOperator } })
})

app.put('/api/admin/orders/:id/assign', adminAuth, (req, res) => {
  const { id } = req.params
  const { agent_id } = req.body
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  
  const agents = loadData('agents')
  const agent = agents.find(a => a.id === Number(agent_id))
  if (!agent) return res.json({ code: 400, message: '业务员不存在' })
  
  if (!agent.services.includes(orders[idx].type)) {
    return res.json({ code: 400, message: '该业务员没有此服务的接单权限' })
  }
  
  orders[idx].agent_id = Number(agent_id)
  orders[idx].assigned_at = new Date().toISOString()
  if (orders[idx].status === 'paid') {
    orders[idx].status = 'assigned'
  }
  saveData('orders', orders)
  
  addOrderLog(Number(id), req.userRole || 'admin', req.userId, 'assign', `分配给业务员：${agent.name}`)
  
  res.json({ code: 0, message: '分配成功' })
})

app.put('/api/admin/orders/:id/reclaim', adminAuth, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  
  const oldAgentId = orders[idx].agent_id
  orders[idx].agent_id = null
  orders[idx].assigned_at = null
  if (orders[idx].status === 'assigned') {
    orders[idx].status = 'paid'
  }
  saveData('orders', orders)
  
  addOrderLog(Number(id), req.userRole || 'admin', req.userId, 'reclaim', '回收订单')
  
  res.json({ code: 0, message: '回收成功' })
})

// ========== 业务员端 - 订单列表 ==========
app.get('/api/agent/orders', agentAuth, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  let orders = loadData('orders').filter(o => o.agent_id === req.agentId)
  
  if (status) {
    orders = orders.filter(o => o.status === status)
  }
  
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

// ========== 业务员端 - 可接订单池（已支付未分配的订单） ==========
app.get('/api/agent/orders/pool', agentAuth, (req, res) => {
  const { type, page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  let orders = loadData('orders').filter(o => 
    o.status === 'paid' && 
    !o.agent_id && 
    req.agent.services.includes(o.type)
  )
  
  if (type) {
    orders = orders.filter(o => o.type === type)
  }
  
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

// ========== 业务员端 - 订单详情 ==========
app.get('/api/agent/orders/:id', agentAuth, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const order = orders.find(o => o.id === Number(id) && o.agent_id === req.agentId)
  
  if (!order) return res.json({ code: 404, message: '订单不存在' })
  
  const orderItems = loadData('order_items').filter(i => i.order_id === order.id)
  const logs = loadData('order_logs')
    .filter(l => l.order_id === order.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  res.json({ code: 0, data: { ...order, items: orderItems, logs } })
})

// ========== 业务员端 - 接单（从订单池抢单） ==========
app.put('/api/agent/orders/:id/accept', agentAuth, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  if (orders[idx].status !== 'paid' || orders[idx].agent_id) {
    return res.json({ code: 400, message: '该订单已被接单' })
  }
  if (!req.agent.services.includes(orders[idx].type)) {
    return res.json({ code: 400, message: '您没有此服务的接单权限' })
  }
  
  orders[idx].agent_id = req.agentId
  orders[idx].status = 'processing'
  orders[idx].assigned_at = new Date().toISOString()
  orders[idx].accepted_at = new Date().toISOString()
  saveData('orders', orders)
  
  const agents = loadData('agents')
  const agentIdx = agents.findIndex(a => a.id === req.agentId)
  if (agentIdx !== -1) {
    agents[agentIdx].total_orders = (agents[agentIdx].total_orders || 0) + 1
    saveData('agents', agents)
  }
  
  addOrderLog(Number(id), 'agent', req.agentId, 'accept', '业务员接单')
  
  notifyUser(orders[idx].user_id, { type: 'order_status_changed', order_id: id, status: 'processing' })
  
  res.json({ code: 0, message: '接单成功' })
})

// ========== 业务员端 - 开始处理 ==========
app.put('/api/agent/orders/:id/process', agentAuth, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id) && o.agent_id === req.agentId)
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  if (!['assigned', 'processing'].includes(orders[idx].status)) {
    return res.json({ code: 400, message: '该订单状态不允许此操作' })
  }
  
  orders[idx].status = 'processing'
  saveData('orders', orders)
  
  addOrderLog(Number(id), 'agent', req.agentId, 'process', '开始处理')
  
  res.json({ code: 0, message: '操作成功' })
})

// ========== 业务员端 - 上传完工凭证并完成 ==========
app.put('/api/agent/orders/:id/complete', agentAuth, (req, res) => {
  const { id } = req.params
  const { proof_images, remark } = req.body
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id) && o.agent_id === req.agentId)
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  if (orders[idx].status !== 'processing') {
    return res.json({ code: 400, message: '该订单状态不允许完成' })
  }
  
  orders[idx].status = 'completed'
  orders[idx].completed_at = new Date().toISOString()
  orders[idx].proof_images = proof_images || []
  orders[idx].completion_remark = remark || ''
  saveData('orders', orders)
  
  const agents = loadData('agents')
  const agentIdx = agents.findIndex(a => a.id === req.agentId)
  if (agentIdx !== -1) {
    const commission = parseFloat((orders[idx].total_amount * COMMISSION_RATE).toFixed(2))
    agents[agentIdx].total_income = parseFloat(((agents[agentIdx].total_income || 0) + commission).toFixed(2))
    agents[agentIdx].balance = parseFloat(((agents[agentIdx].balance || 0) + commission).toFixed(2))
    saveData('agents', agents)
    
    const agentBalanceLogs = loadData('agent_balance_logs')
    agentBalanceLogs.push({
      id: getNextId(agentBalanceLogs),
      agent_id: req.agentId,
      type: 'commission',
      amount: commission,
      balance_after: agents[agentIdx].balance,
      related_id: orders[idx].id,
      related_type: 'order',
      description: `订单佣金 - ${orderTypeLabels[orders[idx].type] || orders[idx].type}`,
      created_at: new Date().toISOString()
    })
    saveData('agent_balance_logs', agentBalanceLogs)
  }
  
  const platformIncome = parseFloat((orders[idx].total_amount * PLATFORM_FEE_RATE).toFixed(2))
  const platformRecords = loadData('platform_income')
  platformRecords.push({
    id: getNextId(platformRecords),
    order_id: orders[idx].id,
    order_type: orders[idx].type,
    agent_id: req.agentId,
    amount: platformIncome,
    total_amount: orders[idx].total_amount,
    description: `订单抽成 - ${orderTypeLabels[orders[idx].type] || orders[idx].type}`,
    created_at: new Date().toISOString()
  })
  saveData('platform_income', platformRecords)
  
  addOrderLog(Number(id), 'agent', req.agentId, 'complete', remark || '订单已完成')
  
  notifyUser(orders[idx].user_id, { type: 'order_status_changed', order_id: id, status: 'completed' })
  
  res.json({ code: 0, message: '提交完成' })
})

// ========== 业务员端 - 个人统计 ==========
app.get('/api/agent/stats', agentAuth, (req, res) => {
  const orders = loadData('orders').filter(o => o.agent_id === req.agentId)
  const today = new Date().toDateString()
  
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const pendingOrders = orders.filter(o => ['assigned', 'processing'].includes(o.status)).length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const totalIncome = req.agent.total_income || 0
  const todayIncome = orders
    .filter(o => o.status === 'completed' && new Date(o.completed_at).toDateString() === today)
    .reduce((sum, o) => sum + parseFloat((o.total_amount * COMMISSION_RATE).toFixed(2)), 0)
  
  const typeStats = {
    print: orders.filter(o => o.type === 'print').length,
    course: orders.filter(o => o.type === 'course').length,
    express: orders.filter(o => o.type === 'express').length,
    handwriting: orders.filter(o => o.type === 'handwriting').length
  }
  
  res.json({
    code: 0,
    data: {
      todayOrders: todayOrders.length,
      pendingOrders,
      completedOrders,
      totalIncome,
      todayIncome: parseFloat(todayIncome.toFixed(2)),
      typeStats
    }
  })
})

// ========== 业务员端 - 修改密码 ==========
app.put('/api/agent/password', agentAuth, (req, res) => {
  const { old_password, new_password } = req.body
  const agents = loadData('agents')
  const idx = agents.findIndex(a => a.id === req.agentId)
  
  if (idx === -1) return res.json({ code: 404, message: '账号不存在' })
  if (!bcrypt.compareSync(old_password, agents[idx].password)) {
    return res.json({ code: 400, message: '原密码错误' })
  }
  
  agents[idx].password = bcrypt.hashSync(new_password, 10)
  saveData('agents', agents)
  
  res.json({ code: 0, message: '修改成功' })
})

// ========== 业务员端 - 个人信息 ==========
app.get('/api/agent/profile', agentAuth, (req, res) => {
  const { password: _, ...agentInfo } = req.agent
  res.json({ code: 0, data: agentInfo })
})

// ========== 业务员端 - 余额明细 ==========
app.get('/api/agent/balance/logs', agentAuth, (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const logs = loadData('agent_balance_logs')
    .filter(l => l.agent_id === req.agentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const offset = (Number(page) - 1) * Number(limit)
  const total = logs.length
  const list = logs.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total, balance: req.agent.balance || 0 } })
})

// ========== 业务员端 - 申请提现 ==========
app.post('/api/agent/withdraw', agentAuth, (req, res) => {
  const { amount, withdraw_method, alipay_account, wechat_account, real_name } = req.body
  
  if (!amount || parseFloat(amount) <= 0) {
    return res.json({ code: 400, message: '请输入正确的提现金额' })
  }
  
  const withdrawAmount = parseFloat(amount)
  if (withdrawAmount > (req.agent.balance || 0)) {
    return res.json({ code: 400, message: '余额不足' })
  }
  
  if (!['alipay', 'wechat'].includes(withdraw_method)) {
    return res.json({ code: 400, message: '请选择提现方式' })
  }
  
  if (withdraw_method === 'alipay' && !alipay_account) {
    return res.json({ code: 400, message: '请输入支付宝账号' })
  }
  if (withdraw_method === 'wechat' && !wechat_account) {
    return res.json({ code: 400, message: '请输入微信账号' })
  }
  if (!real_name) {
    return res.json({ code: 400, message: '请输入真实姓名' })
  }
  
  const configs = loadData('configs')
  const minWithdraw = parseFloat(configs.find(c => c.key_name === 'withdraw_min_amount')?.value || '10')
  if (withdrawAmount < minWithdraw) {
    return res.json({ code: 400, message: `最低提现金额为${minWithdraw}元` })
  }
  
  const agents = loadData('agents')
  const agentIdx = agents.findIndex(a => a.id === req.agentId)
  if (agentIdx === -1) return res.json({ code: 404, message: '账号不存在' })
  
  agents[agentIdx].balance = parseFloat(((agents[agentIdx].balance || 0) - withdrawAmount).toFixed(2))
  if (agents[agentIdx].balance < 0) agents[agentIdx].balance = 0
  saveData('agents', agents)
  
  const withdrawals = loadData('agent_withdrawals')
  const newWithdrawal = {
    id: getNextId(withdrawals),
    agent_id: req.agentId,
    agent_name: req.agent.name,
    amount: withdrawAmount,
    withdraw_method,
    alipay_account: alipay_account || '',
    wechat_account: wechat_account || '',
    real_name: real_name || '',
    status: 'pending',
    created_at: new Date().toISOString(),
    processed_at: null,
    remark: ''
  }
  withdrawals.push(newWithdrawal)
  saveData('agent_withdrawals', withdrawals)
  
  const balanceLogs = loadData('agent_balance_logs')
  balanceLogs.push({
    id: getNextId(balanceLogs),
    agent_id: req.agentId,
    type: 'withdraw',
    amount: -withdrawAmount,
    balance_before: req.agent.balance || 0,
    balance_after: agents[agentIdx].balance,
    description: `提现申请 - ${withdraw_method === 'alipay' ? '支付宝' : '微信'}`,
    related_id: newWithdrawal.id,
    created_at: new Date().toISOString()
  })
  saveData('agent_balance_logs', balanceLogs)
  
  res.json({ code: 0, message: '提现申请已提交，等待审核' })
})

// ========== 业务员端 - 提现记录 ==========
app.get('/api/agent/withdrawals', agentAuth, (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  let withdrawals = loadData('agent_withdrawals').filter(w => w.agent_id === req.agentId)
  
  if (status) {
    withdrawals = withdrawals.filter(w => w.status === status)
  }
  
  withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const offset = (Number(page) - 1) * Number(limit)
  const total = withdrawals.length
  const list = withdrawals.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

// ========== 超级管理员 - 业务员提现列表 ==========
app.get('/api/super-admin/agent-withdrawals', superAdminAuth, (req, res) => {
  const { page = 1, limit = 20, status, agent_id } = req.query
  let withdrawals = loadData('agent_withdrawals')
  
  if (status) {
    withdrawals = withdrawals.filter(w => w.status === status)
  }
  if (agent_id) {
    withdrawals = withdrawals.filter(w => w.agent_id === Number(agent_id))
  }
  
  withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const offset = (Number(page) - 1) * Number(limit)
  const total = withdrawals.length
  const list = withdrawals.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

// ========== 超级管理员 - 审核业务员提现 ==========
app.put('/api/super-admin/agent-withdrawals/:id/status', superAdminAuth, (req, res) => {
  const { id } = req.params
  const { status, remark } = req.body
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.json({ code: 400, message: '状态不合法' })
  }
  
  const withdrawals = loadData('agent_withdrawals')
  const idx = withdrawals.findIndex(w => w.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '提现申请不存在' })
  if (withdrawals[idx].status !== 'pending') {
    return res.json({ code: 400, message: '该申请已处理' })
  }
  
  if (status === 'rejected') {
    const agents = loadData('agents')
    const agentIdx = agents.findIndex(a => a.id === withdrawals[idx].agent_id)
    if (agentIdx !== -1) {
      const balanceBefore = agents[agentIdx].balance || 0
      agents[agentIdx].balance = parseFloat((balanceBefore + withdrawals[idx].amount).toFixed(2))
      saveData('agents', agents)
      
      const balanceLogs = loadData('agent_balance_logs')
      balanceLogs.push({
        id: getNextId(balanceLogs),
        agent_id: withdrawals[idx].agent_id,
        type: 'withdraw_reject',
        amount: withdrawals[idx].amount,
        balance_before: balanceBefore,
        balance_after: agents[agentIdx].balance,
        description: '提现驳回，金额退回',
        related_id: withdrawals[idx].id,
        created_at: new Date().toISOString()
      })
      saveData('agent_balance_logs', balanceLogs)
    }
  }
  
  withdrawals[idx].status = status
  withdrawals[idx].processed_at = new Date().toISOString()
  withdrawals[idx].remark = remark || ''
  saveData('agent_withdrawals', withdrawals)
  
  res.json({ code: 0, message: '处理成功' })
})

// ========== 超级管理员 - 数据统计看板（增强版） ==========
app.get('/api/super-admin/stats', superAdminAuth, (req, res) => {
  const orders = loadData('orders')
  const agents = loadData('agents')
  const users = loadData('users').filter(u => u.role === 'user')
  const today = new Date().toDateString()
  
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const todayIncome = todayOrders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)
  
  const pendingOrders = orders.filter(o => ['paid', 'assigned', 'processing'].includes(o.status)).length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  
  const typeStats = {
    print: orders.filter(o => o.type === 'print').length,
    course: orders.filter(o => o.type === 'course').length,
    express: orders.filter(o => o.type === 'express').length,
    handwriting: orders.filter(o => o.type === 'handwriting').length
  }
  
  const agentRankings = [...agents]
    .map(a => ({
      id: a.id,
      name: a.name,
      username: a.username,
      total_orders: a.total_orders || 0,
      total_income: a.total_income || 0
    }))
    .sort((a, b) => b.total_orders - a.total_orders)
    .slice(0, 10)
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
  
  const totalRevenue = orders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)
  
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo)
  const weekIncome = weekOrders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)
  
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo)
  const monthIncome = monthOrders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)
  
  res.json({
    code: 0,
    data: {
      stats: {
        todayOrders: todayOrders.length,
        todayIncome: parseFloat(todayIncome.toFixed(2)),
        pendingOrders,
        completedOrders,
        totalOrders: orders.length,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        weekOrders: weekOrders.length,
        weekIncome: parseFloat(weekIncome.toFixed(2)),
        monthOrders: monthOrders.length,
        monthIncome: parseFloat(monthIncome.toFixed(2)),
        totalUsers: users.length,
        totalAgents: agents.length
      },
      typeStats,
      agentRankings,
      recentOrders
    }
  })
})

// ========== 超级管理员 - 订单管理 ==========
app.get('/api/super-admin/orders', superAdminAuth, (req, res) => {
  const { status, type, page = 1, limit = 20, keyword = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let orders = loadData('orders')
  
  if (status) {
    orders = orders.filter(o => o.status === status)
  }
  if (type) {
    orders = orders.filter(o => o.type === type)
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    orders = orders.filter(o => 
      o.order_no?.toLowerCase().includes(kw) || 
      o.name?.toLowerCase().includes(kw) ||
      o.phone?.includes(kw)
    )
  }
  
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total, page: Number(page), limit: Number(limit) } })
})

// ========== 超级管理员 - 待确认收款的订单列表 ==========
app.get('/api/super-admin/orders/pending-confirm', superAdminAuth, (req, res) => {
  const { page = 1, limit = 50 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  // 获取所有 pending_confirm 状态的订单
  let orders = loadData('orders').filter(o => o.status === 'pending_confirm')
  
  // 获取用户信息
  const users = loadData('users')
  orders = orders.map(order => {
    const user = users.find(u => u.id === order.user_id)
    return {
      ...order,
      user_phone: user?.phone || '',
      user_nickname: user?.nickname || ''
    }
  })
  
  orders.sort((a, b) => new Date(b.transfer_submitted_at || b.created_at) - new Date(a.transfer_submitted_at || a.created_at))
  
  const total = orders.length
  const list = orders.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

// 超级管理员 - 确认收款
app.put('/api/super-admin/orders/:id/confirm-payment', superAdminAuth, (req, res) => {
  const { id } = req.params
  const orders = loadData('orders')
  const idx = orders.findIndex(o => o.id === Number(id))
  
  if (idx === -1) return res.json({ code: 404, message: '订单不存在' })
  if (!['pending', 'pending_confirm'].includes(orders[idx].status)) {
    return res.json({ code: 400, message: '该订单状态无法确认收款' })
  }
  
  orders[idx].status = 'paid'
  orders[idx].paid_at = new Date().toISOString()
  saveData('orders', orders)
  
  const paymentRecords = loadData('payment_records')
  paymentRecords.push({
    id: getNextId(paymentRecords),
    order_id: orders[idx].id,
    order_no: orders[idx].order_no,
    order_type: orders[idx].type,
    user_id: orders[idx].user_id,
    amount: orders[idx].total_amount,
    pay_method: 'manual',
    trade_no: '',
    status: 'success',
    verify_type: 'manual',
    admin_id: req.userId,
    created_at: new Date().toISOString()
  })
  saveData('payment_records', paymentRecords)
  
  addOrderLog(Number(id), 'super_admin', req.userId, 'confirm_payment', '管理员确认收款')
  
  notifyUser(orders[idx].user_id, { type: 'order_paid', order_id: id })
  
  res.json({ code: 0, message: '确认收款成功' })
})

// ========== 超级管理员 - 支付流水列表 ==========
app.get('/api/super-admin/payment-records', superAdminAuth, (req, res) => {
  const { page = 1, limit = 50, type = '', verify_type = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let records = loadData('payment_records')
  
  if (type) {
    records = records.filter(r => r.order_type === type)
  }
  if (verify_type) {
    records = records.filter(r => r.verify_type === verify_type)
  }
  
  const users = loadData('users')
  records = records.map(record => {
    const user = users.find(u => u.id === record.user_id)
    return {
      ...record,
      user_phone: user?.phone || '',
      user_nickname: user?.nickname || '',
      type_label: orderTypeLabels[record.order_type] || record.order_type
    }
  })
  
  records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const total = records.length
  const list = records.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

// ========== 超级管理员 - 服务定价 ==========
app.get('/api/super-admin/services', superAdminAuth, (req, res) => {
  const configs = loadData('configs')
  res.json({ code: 0, data: configs })
})

app.put('/api/super-admin/services', superAdminAuth, (req, res) => {
  const { key, value } = req.body
  const configs = loadData('configs')
  const idx = configs.findIndex(c => c.key_name === key)
  
  if (idx === -1) return res.json({ code: 404, message: '配置不存在' })
  
  configs[idx].value = value
  saveData('configs', configs)
  res.json({ code: 0, message: '更新成功' })
})

// ========== 超级管理员 - 上传收款码图片 ==========
app.post('/api/super-admin/upload-qrcode', superAdminAuth, (req, res) => {
  const { image, type } = req.body
  
  if (!image || !type) {
    return res.json({ code: 400, message: '参数不完整' })
  }
  
  if (!['alipay', 'wechat'].includes(type)) {
    return res.json({ code: 400, message: '类型不支持' })
  }
  
  try {
    // 解析base64图片
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const ext = image.match(/^data:image\/(\w+);base64,/)?.[1] || 'png'
    const filename = `${type}_qrcode_${Date.now()}.${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)
    
    fs.writeFileSync(filePath, base64Data, 'base64')
    
    const imageUrl = `/uploads/${filename}`
    
    // 更新配置
    const configs = loadData('configs')
    const configKey = type === 'alipay' ? 'alipay_qrcode' : 'wechat_qrcode'
    const idx = configs.findIndex(c => c.key_name === configKey)
    
    if (idx !== -1) {
      configs[idx].value = imageUrl
    } else {
      configs.push({
        key_name: configKey,
        value: imageUrl,
        description: type === 'alipay' ? '支付宝收款码URL' : '微信收款码URL'
      })
    }
    saveData('configs', configs)
    
    res.json({ code: 0, message: '上传成功', data: { url: imageUrl } })
  } catch (e) {
    console.error('上传图片失败', e)
    res.json({ code: 500, message: '上传失败' })
  }
})

// ========== 超级管理员 - 资金财务（含平台收入/提现） ==========
app.get('/api/super-admin/finance/stats', superAdminAuth, (req, res) => {
  const orders = loadData('orders')
  const agents = loadData('agents')
  const platformIncomeList = loadData('platform_income')
  const platformWithdrawals = loadData('platform_withdrawals')
  
  const totalRevenue = orders
    .filter(o => ['paid', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)
  
  const totalPlatformIncome = platformIncomeList
    .reduce((sum, r) => sum + r.amount, 0)
  
  const totalPlatformWithdraw = platformWithdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0)
  
  const platformBalance = parseFloat((totalPlatformIncome - totalPlatformWithdraw).toFixed(2))
  
  const totalAgentCommission = agents
    .reduce((sum, a) => sum + (a.total_income || 0), 0)
  
  const totalAgentBalance = agents
    .reduce((sum, a) => sum + (a.balance || 0), 0)
  
  const today = new Date().toDateString()
  const todayPlatformIncome = platformIncomeList
    .filter(r => new Date(r.created_at).toDateString() === today)
    .reduce((sum, r) => sum + r.amount, 0)
  
  const recentRecords = [...platformIncomeList]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20)
    .map(r => ({
      ...r,
      type: 'income',
      agent_name: agents.find(a => a.id === r.agent_id)?.name || '未知'
    }))
  
  res.json({
    code: 0,
    data: {
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalPlatformIncome: parseFloat(totalPlatformIncome.toFixed(2)),
        totalPlatformWithdraw: parseFloat(totalPlatformWithdraw.toFixed(2)),
        platformBalance,
        totalAgentCommission: parseFloat(totalAgentCommission.toFixed(2)),
        totalAgentBalance: parseFloat(totalAgentBalance.toFixed(2)),
        todayPlatformIncome: parseFloat(todayPlatformIncome.toFixed(2))
      },
      recentRecords
    }
  })
})

app.get('/api/super-admin/platform-income', superAdminAuth, (req, res) => {
  const { page = 1, limit = 20, type = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let records = loadData('platform_income')
  if (type) {
    records = records.filter(r => r.order_type === type)
  }
  records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const total = records.length
  const list = records.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.get('/api/super-admin/platform-withdrawals', superAdminAuth, (req, res) => {
  const { page = 1, limit = 20, status = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let withdrawals = loadData('platform_withdrawals')
  if (status) {
    withdrawals = withdrawals.filter(w => w.status === status)
  }
  withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  const total = withdrawals.length
  const list = withdrawals.slice(offset, offset + Number(limit))
  
  res.json({ code: 0, data: { list, total } })
})

app.post('/api/super-admin/platform-withdraw', superAdminAuth, (req, res) => {
  const { amount, withdraw_method, alipay_account, wechat_account, real_name } = req.body
  
  if (!amount || parseFloat(amount) <= 0) {
    return res.json({ code: 400, message: '请输入正确的提现金额' })
  }
  
  const withdrawAmount = parseFloat(amount)
  
  const platformIncomeList = loadData('platform_income')
  const platformWithdrawals = loadData('platform_withdrawals')
  
  const totalIncome = platformIncomeList.reduce((sum, r) => sum + r.amount, 0)
  const totalWithdrawn = platformWithdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0)
  const platformBalance = totalIncome - totalWithdrawn
  
  if (withdrawAmount > platformBalance) {
    return res.json({ code: 400, message: '余额不足' })
  }
  
  if (!['alipay', 'wechat'].includes(withdraw_method)) {
    return res.json({ code: 400, message: '不支持的提现方式' })
  }
  
  if (withdraw_method === 'alipay' && !alipay_account) {
    return res.json({ code: 400, message: '请输入支付宝账号' })
  }
  if (withdraw_method === 'wechat' && !wechat_account) {
    return res.json({ code: 400, message: '请输入微信账号' })
  }
  if (!real_name) {
    return res.json({ code: 400, message: '请输入真实姓名' })
  }
  
  const newWithdrawal = {
    id: getNextId(platformWithdrawals),
    admin_id: req.userId,
    amount: withdrawAmount,
    withdraw_method,
    alipay_account: alipay_account || '',
    wechat_account: wechat_account || '',
    real_name,
    status: 'approved',
    remark: '平台管理员提现',
    created_at: new Date().toISOString(),
    processed_at: new Date().toISOString()
  }
  
  platformWithdrawals.push(newWithdrawal)
  saveData('platform_withdrawals', platformWithdrawals)
  
  res.json({ code: 0, message: '提现申请已提交', data: newWithdrawal })
})

// ========== 公开接口 - 获取服务定价 ==========
app.get('/api/services/prices', (req, res) => {
  const configs = loadData('configs')
  const prices = {}
  configs.forEach(c => {
    prices[c.key_name] = c.value
  })
  res.json({ code: 0, data: prices })
})

// ========== 公开接口 - 获取收款码 ==========
app.get('/api/payment/qrcode', (req, res) => {
  const configs = loadData('configs')
  const getConfig = (key) => configs.find(c => c.key_name === key)?.value || ''
  
  res.json({
    code: 0,
    data: {
      alipay_qrcode: getConfig('alipay_qrcode'),
      wechat_qrcode: getConfig('wechat_qrcode'),
      admin_alipay: getConfig('admin_alipay'),
      admin_wechat: getConfig('admin_wechat'),
      payment_mode: getConfig('payment_mode')
    }
  })
})

let currentPort = 40000

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${currentPort} 被占用，尝试端口 ${currentPort + 1}...`)
    currentPort++
  }
})

// 前端静态文件托管
const DIST_DIR = path.join(__dirname, '../dist')
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

wss.on('error', () => {})

server.on('listening', () => {
  const port = server.address().port
  console.log(`服务器运行在 http://localhost:${port}`)
  console.log(`API地址: http://localhost:${port}/api`)
  fs.writeFileSync(path.join(__dirname, '../.api_port'), String(port))
})

function startServer() {
  try {
    server.listen(currentPort, '0.0.0.0')
  } catch (e) {
    currentPort++
    startServer()
  }
}

setInterval(() => {
  if (!server.listening) {
    currentPort++
    try {
      server.listen(currentPort, '0.0.0.0')
    } catch (e) {}
  }
}, 200)

startServer()
