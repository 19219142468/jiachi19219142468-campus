import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, '../../data.db'))

// 初始化数据库
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT,
    avatar TEXT,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    detail TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    address_id INTEGER,
    pickup_time DATETIME,
    paid_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    file_url TEXT,
    file_name TEXT,
    print_type TEXT DEFAULT 'black',
    pages INTEGER DEFAULT 0,
    sides TEXT DEFAULT 'single',
    copies INTEGER DEFAULT 1,
    binding TEXT DEFAULT 'none',
    platform TEXT,
    course_name TEXT,
    course_url TEXT,
    course_account TEXT,
    course_password TEXT,
    urgent INTEGER DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id INTEGER,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_before REAL,
    balance_after REAL,
    status TEXT DEFAULT 'completed',
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    account TEXT NOT NULL,
    account_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payment_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    mode TEXT DEFAULT 'platform',
    app_id TEXT,
    app_key TEXT,
    status INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 初始化管理员账号
const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin')
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO users (phone, password, nickname, role) VALUES (?, ?, ?, ?)').run('13800138000', hashedPassword, '管理员', 'admin')
}

// 初始化服务配置
const configs = [
  { key_name: 'black_print_price', value: '0.2', description: '黑白打印价格' },
  { key_name: 'color_print_price', value: '0.3', description: '彩色打印价格' },
  { key_name: 'staple_binding_price', value: '0.5', description: '订书钉装订价格' },
  { key_name: 'spiral_binding_price', value: '2', description: '胶圈装订价格' },
  { key_name: 'course_base_price', value: '2', description: '课业时长整理服务基础价格' },
  { key_name: 'course_urgent_price', value: '3', description: '课业时长整理服务加急价格' },
  { key_name: 'payment_mode', value: 'platform', description: '支付模式 direct=直接到账 platform=平台余额' }
]

configs.forEach(config => {
  const exists = db.prepare('SELECT id FROM service_config WHERE key_name = ?').get(config.key_name)
  if (!exists) {
    db.prepare('INSERT INTO service_config (key_name, value, description) VALUES (?, ?, ?)').run(config.key_name, config.value, config.description)
  }
})

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = 'campus-service-secret-key-2024'

// 认证中间件
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' })
  }
}

// 生成订单号
function generateOrderNo() {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
}

// 验证码模拟存储
const codeStore: Record<string, string> = {}

// 发送验证码
app.post('/api/auth/sendCode', (req, res) => {
  const { phone } = req.body
  if (!phone || phone.length !== 11) {
    return res.json({ code: 400, message: '请输入正确的手机号' })
  }
  // 模拟发送验证码，实际应接入短信服务
  const code = Math.random().toString().slice(2, 8)
  codeStore[phone] = code
  console.log(`验证码 ${code} 已发送至 ${phone}`)
  res.json({ code: 0, message: '发送成功' })
})

// 注册
app.post('/api/auth/register', (req, res) => {
  const { phone, code, password } = req.body
  
  if (codeStore[phone] !== code) {
    return res.json({ code: 400, message: '验证码错误' })
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  
  try {
    const stmt = db.prepare('INSERT INTO users (phone, password) VALUES (?, ?)')
    const result = stmt.run(phone, hashedPassword)
    
    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' })
    const user = db.prepare('SELECT id, phone, nickname, balance, role FROM users WHERE id = ?').get(result.lastInsertRowid)
    
    delete codeStore[phone]
    
    res.json({ code: 0, data: { token, user } })
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) {
      res.json({ code: 400, message: '该手机号已注册' })
    } else {
      res.json({ code: 500, message: '注册失败' })
    }
  }
})

// 登录
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body
  
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ code: 400, message: '手机号或密码错误' })
  }
  
  if (user.status === 0) {
    return res.json({ code: 400, message: '账号已被禁用' })
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  
  res.json({ 
    code: 0, 
    data: { 
      token, 
      user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar, balance: user.balance, role: user.role } 
    } 
  })
})

// 获取用户信息
app.get('/api/auth/userinfo', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, phone, nickname, avatar, balance, role FROM users WHERE id = ?').get(req.userId)
  res.json({ code: 0, data: user })
})

// 获取用户资料
app.get('/api/user/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, phone, nickname, avatar, balance FROM users WHERE id = ?').get(req.userId)
  res.json({ code: 0, data: user })
})

// 更新用户资料
app.put('/api/user/profile', authMiddleware, (req, res) => {
  const { nickname, avatar } = req.body
  db.prepare('UPDATE users SET nickname = ?, avatar = ? WHERE id = ?').run(nickname, avatar, req.userId)
  res.json({ code: 0, message: '更新成功' })
})

// 获取地址列表
app.get('/api/user/addresses', authMiddleware, (req, res) => {
  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(req.userId)
  res.json({ code: 0, data: addresses })
})

// 添加地址
app.post('/api/user/addresses', authMiddleware, (req, res) => {
  const { name, phone, location, detail, is_default } = req.body
  
  if (is_default) {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.userId)
  }
  
  const result = db.prepare('INSERT INTO addresses (user_id, name, phone, location, detail, is_default) VALUES (?, ?, ?, ?, ?, ?)').run(req.userId, name, phone, location, detail, is_default ? 1 : 0)
  
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid)
  res.json({ code: 0, data: address })
})

// 更新地址
app.put('/api/user/addresses/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { name, phone, location, detail, is_default } = req.body
  
  if (is_default) {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.userId)
  }
  
  db.prepare('UPDATE addresses SET name = ?, phone = ?, location = ?, detail = ?, is_default = ? WHERE id = ? AND user_id = ?').run(name, phone, location, detail, is_default ? 1 : 0, id, req.userId)
  res.json({ code: 0, message: '更新成功' })
})

// 删除地址
app.delete('/api/user/addresses/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, req.userId)
  res.json({ code: 0, message: '删除成功' })
})

// 创建打印订单
app.post('/api/orders/print', authMiddleware, (req, res) => {
  const { items, address_id, pickup_time } = req.body
  
  // 计算价格
  const blackPrice = parseFloat(db.prepare('SELECT value FROM service_config WHERE key_name = ?').get('black_print_price')?.value || '0.2')
  const colorPrice = parseFloat(db.prepare('SELECT value FROM service_config WHERE key_name = ?').get('color_print_price')?.value || '0.3')
  const staplePrice = parseFloat(db.prepare('SELECT value FROM service_config WHERE key_name = ?').get('staple_binding_price')?.value || '0.5')
  const spiralPrice = parseFloat(db.prepare('SELECT value FROM service_config WHERE key_name = ?').get('spiral_binding_price')?.value || '2')
  
  let totalAmount = 0
  items.forEach((item: any) => {
    const unitPrice = item.print_type === 'black' ? blackPrice : colorPrice
    const bindingPrice = item.binding === 'staple' ? staplePrice : item.binding === 'spiral' ? spiralPrice : 0
    totalAmount += (unitPrice + bindingPrice) * item.copies
  })
  
  const orderNo = generateOrderNo()
  
  // 创建订单
  const orderResult = db.prepare('INSERT INTO orders (order_no, user_id, type, total_amount, address_id, pickup_time) VALUES (?, ?, ?, ?, ?, ?)').run(orderNo, req.userId, 'print', totalAmount, address_id, pickup_time)
  
  // 创建订单项
  const insertItem = db.prepare('INSERT INTO order_items (order_id, file_url, file_name, print_type, pages, sides, copies, binding) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  items.forEach((item: any) => {
    insertItem.run(orderResult.lastInsertRowid, item.file_url, item.file_name, item.print_type, item.pages || 1, item.sides, item.copies, item.binding)
  })
  
  res.json({ code: 0, data: { id: orderResult.lastInsertRowid, order_no: orderNo, total_amount: totalAmount } })
})

// 创建网课订单
app.post('/api/orders/course', authMiddleware, (req, res) => {
  const { platform, course_name, course_url, account, password, urgent } = req.body
  
  const basePrice = parseFloat(db.prepare('SELECT value FROM service_config WHERE key_name = ?').get('course_base_price')?.value || '2')
  const urgentPrice = parseFloat(db.prepare('SELECT value FROM service_config WHERE key_name = ?').get('course_urgent_price')?.value || '3')
  
  const totalAmount = basePrice + (urgent ? urgentPrice : 0)
  const orderNo = generateOrderNo()
  
  const orderResult = db.prepare('INSERT INTO orders (order_no, user_id, type, total_amount) VALUES (?, ?, ?, ?)').run(orderNo, req.userId, 'course', totalAmount)
  
  // 密码加密存储
  const encryptedPassword = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO order_items (order_id, platform, course_name, course_url, course_account, course_password, urgent) VALUES (?, ?, ?, ?, ?, ?, ?)').run(orderResult.lastInsertRowid, platform, course_name, course_url, account, encryptedPassword, urgent ? 1 : 0)
  
  res.json({ code: 0, data: { id: orderResult.lastInsertRowid, order_no: orderNo, total_amount: totalAmount } })
})

// 获取订单列表
app.get('/api/orders', authMiddleware, (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let sql = 'SELECT * FROM orders WHERE user_id = ?'
  const params: any[] = [req.userId]
  
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), offset)
  
  const orders = db.prepare(sql).all(...params)
  
  // 获取总数
  let countSql = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?'
  const countParams: any[] = [req.userId]
  if (status) {
    countSql += ' AND status = ?'
    countParams.push(status)
  }
  const { total } = db.prepare(countSql).get(...countParams) as any
  
  res.json({ code: 0, data: { list: orders, total } })
})

// 获取订单详情
app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.userId) as any
  
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id)
  const address = order.address_id ? db.prepare('SELECT * FROM addresses WHERE id = ?').get(order.address_id) : null
  
  res.json({ code: 0, data: { ...order, items, address } })
})

// 取消订单
app.put('/api/orders/:id/cancel', authMiddleware, (req, res) => {
  const { id } = req.params
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.userId) as any
  
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  
  if (order.status !== 'pending') {
    return res.json({ code: 400, message: '该订单无法取消' })
  }
  
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', id)
  res.json({ code: 0, message: '取消成功' })
})

// 创建支付
app.post('/api/pay/create', authMiddleware, (req, res) => {
  const { order_id, pay_method } = req.body
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.userId) as any
  
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  
  if (order.status !== 'pending') {
    return res.json({ code: 400, message: '该订单已支付' })
  }
  
  // 模拟支付链接
  const payUrl = pay_method === 'alipay' ? 'https://open.alipay.com/mock' : 'https://wx.tenpay.com/mock'
  
  res.json({ code: 0, data: { pay_url: payUrl, qr_code: 'mock-qr-code' } })
})

// 模拟支付回调
app.post('/api/pay/notify', (req, res) => {
  // 实际应根据BufPay等支付平台的回调处理
  res.json({ code: 0 })
})

// 支付状态查询
app.get('/api/pay/status/:orderId', authMiddleware, (req, res) => {
  const { orderId } = req.params
  const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId)
  res.json({ code: 0, data: { status: (order as any)?.status } })
})

// 支付结果查询（模拟直接标记为已支付）
app.get('/api/pay/result/:orderId', authMiddleware, (req, res) => {
  const { orderId } = req.params
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.userId) as any
  
  if (!order) {
    return res.json({ code: 404, message: '订单不存在' })
  }
  
  // 模拟支付成功
  if (order.status === 'pending') {
    db.prepare('UPDATE orders SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?').run('paid', orderId)
    
    // 如果是充值订单
    if (order.type === 'recharge') {
      const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId) as any
      const newBalance = user.balance + order.total_amount
      db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, req.userId)
      db.prepare('INSERT INTO transactions (user_id, order_id, type, amount, balance_before, balance_after, remark) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.userId, orderId, 'recharge', order.total_amount, user.balance, newBalance, '余额充值')
    }
  }
  
  res.json({ code: 0, data: { status: 'paid' } })
})

// 获取余额
app.get('/api/finance/balance', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId) as any
  const todayIncome = db.prepare('SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = ? AND date(created_at) = date("now")').get(req.userId, 'recharge') as any
  
  res.json({ code: 0, data: { balance: user?.balance || 0, today_income: todayIncome?.total || 0 } })
})

// 充值
app.post('/api/finance/recharge', authMiddleware, (req, res) => {
  const { amount, pay_method } = req.body
  
  const orderNo = generateOrderNo()
  db.prepare('INSERT INTO orders (order_no, user_id, type, total_amount, status) VALUES (?, ?, ?, ?, ?)').run(orderNo, req.userId, 'recharge', amount, 'pending')
  
  res.json({ code: 0, data: { order_id: orderNo, pay_url: 'mock-pay-url' } })
})

// 提现申请
app.post('/api/finance/withdraw', authMiddleware, (req, res) => {
  const { amount, account, type } = req.body
  
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.userId) as any
  if (user.balance < amount) {
    return res.json({ code: 400, message: '余额不足' })
  }
  
  db.prepare('INSERT INTO withdrawals (user_id, amount, account, account_type) VALUES (?, ?, ?, ?)').run(req.userId, amount, account, type)
  
  res.json({ code: 0, message: '提现申请已提交' })
})

// 获取交易记录
app.get('/api/finance/records', authMiddleware, (req, res) => {
  const { type, page = 1 } = req.query
  const limit = 20
  const offset = (Number(page) - 1) * limit
  
  let sql = 'SELECT * FROM transactions WHERE user_id = ?'
  const params: any[] = [req.userId]
  
  if (type) {
    sql += ' AND type = ?'
    params.push(type)
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  const records = db.prepare(sql).all(...params)
  
  res.json({ code: 0, data: records })
})

// ======= 管理后台API =======

// 验证管理员
function adminAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId) as any
    if (user?.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权限' })
    }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ code: 401, message: '登录已过期' })
  }
}

// 获取统计数据
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const todayOrders = db.prepare('SELECT COUNT(*) as total FROM orders WHERE date(created_at) = date("now")').get() as any
  const todayIncome = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status IN ("paid", "completed") AND date(created_at) = date("now")').get() as any
  const printOrders = db.prepare('SELECT COUNT(*) as total FROM orders WHERE type = "print"').get() as any
  const courseOrders = db.prepare('SELECT COUNT(*) as total FROM orders WHERE type = "course"').get() as any
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10').all()
  
  res.json({ 
    code: 0, 
    data: { 
      stats: {
        todayOrders: todayOrders?.total || 0,
        todayIncome: todayIncome?.total || 0,
        printOrders: printOrders?.total || 0,
        courseOrders: courseOrders?.total || 0
      },
      recentOrders 
    } 
  })
})

// 获取所有订单
app.get('/api/admin/orders', adminAuth, (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let sql = 'SELECT * FROM orders WHERE 1=1'
  const params: any[] = []
  
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }
  if (type) {
    sql += ' AND type = ?'
    params.push(type)
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), offset)
  
  const orders = db.prepare(sql).all(...params)
  
  let countSql = 'SELECT COUNT(*) as total FROM orders WHERE 1=1'
  const countParams: any[] = []
  if (status) { countSql += ' AND status = ?'; countParams.push(status) }
  if (type) { countSql += ' AND type = ?'; countParams.push(type) }
  const { total } = db.prepare(countSql).get(...countParams) as any
  
  res.json({ code: 0, data: { list: orders, total } })
})

// 更新订单状态
app.put('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  
  const updateData: any = { status }
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }
  
  db.prepare('UPDATE orders SET status = ?, completed_at = ? WHERE id = ?').run(status, status === 'completed' ? new Date().toISOString() : null, id)
  
  res.json({ code: 0, message: '更新成功' })
})

// 获取所有用户
app.get('/api/admin/users', adminAuth, (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  const users = db.prepare('SELECT id, phone, nickname, balance, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').all(Number(limit), offset)
  const { total } = db.prepare('SELECT COUNT(*) as total FROM users').get() as any
  
  res.json({ code: 0, data: { list: users, total } })
})

// 更新用户状态
app.put('/api/admin/users/:id/status', adminAuth, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id)
  
  res.json({ code: 0, message: '更新成功' })
})

// 获取服务配置
app.get('/api/admin/services', adminAuth, (req, res) => {
  const configs = db.prepare('SELECT * FROM service_config').all()
  res.json({ code: 0, data: configs })
})

// 更新服务配置
app.put('/api/admin/services', adminAuth, (req, res) => {
  const { key, value } = req.body
  
  db.prepare('UPDATE service_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?').run(value, key)
  
  res.json({ code: 0, message: '更新成功' })
})

// 获取财务统计
app.get('/api/admin/finance/stats', adminAuth, (req, res) => {
  const totalBalance = db.prepare('SELECT SUM(balance) as total FROM users WHERE role = "user"').get() as any
  const todayIncome = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status IN ("paid", "completed") AND type = "recharge" AND date(created_at) = date("now")').get() as any
  const monthIncome = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status IN ("paid", "completed") AND type = "recharge" AND strftime("%Y-%m", created_at) = strftime("%Y-%m", "now")').get() as any
  const records = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50').all()
  
  res.json({ 
    code: 0, 
    data: { 
      stats: {
        totalBalance: totalBalance?.total || 0,
        todayIncome: todayIncome?.total || 0,
        monthIncome: monthIncome?.total || 0
      },
      records 
    } 
  })
})

// 获取提现申请列表
app.get('/api/admin/withdraw', adminAuth, (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  
  let sql = 'SELECT * FROM withdrawals WHERE 1=1'
  const params: any[] = []
  
  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), offset)
  
  const withdrawals = db.prepare(sql).all(...params)
  const { total } = db.prepare('SELECT COUNT(*) as total FROM withdrawals').get() as any
  
  res.json({ code: 0, data: { list: withdrawals, total } })
})

// 处理提现申请
app.put('/api/admin/withdraw/:id/status', adminAuth, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  
  const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(id) as any
  
  if (status === 'approved') {
    // 扣除用户余额
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(withdrawal.user_id) as any
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(withdrawal.amount, withdrawal.user_id)
  }
  
  db.prepare('UPDATE withdrawals SET status = ?, processed_at = ? WHERE id = ?').run(status, new Date().toISOString(), id)
  
  res.json({ code: 0, message: '处理成功' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
