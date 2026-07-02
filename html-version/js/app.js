const STORAGE_KEYS = {
  ORDERS: 'campus_orders',
  AGENTS: 'campus_agents',
  ADMIN: 'campus_admin',
  CURRENT_AGENT: 'campus_current_agent',
  CURRENT_ADMIN: 'campus_current_admin'
};

const SERVICE_NAMES = {
  express: '快递代取',
  print: '打印复印',
  course: '课程辅导',
  handwriting: '代写服务'
};

const STATUS_NAMES = {
  pending: '待支付',
  paid: '待接单',
  processing: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) {
    const defaultAgents = [
      { id: 1, name: '张师傅', phone: '13800000001', password: '123456', status: 'active', orderCount: 0, totalIncome: 0 },
      { id: 2, name: '李师傅', phone: '13800000002', password: '123456', status: 'active', orderCount: 0, totalIncome: 0 }
    ];
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(defaultAgents));
  }
}

function getOrders() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function getAgents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.AGENTS) || '[]');
}

function saveAgents(agents) {
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
}

function generateOrderNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function goHome() {
  window.location.href = 'index.html';
}

function goOrder(type) {
  window.location.href = `order.html?type=${type || ''}`;
}

function goMyOrders() {
  window.location.href = 'my-orders.html';
}

function goAdminLogin() {
  window.location.href = 'admin-login.html';
}

function goAgentLogin() {
  window.location.href = 'agent-login.html';
}

function initOrderPage() {
  initData();
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  if (type) {
    document.getElementById('serviceType').value = type;
    toggleServiceFields(type);
  }
  updatePrice();
  const titleMap = {
    express: '快递代取下单',
    print: '打印复印下单',
    course: '课程辅导下单',
    handwriting: '代写服务下单'
  };
  document.getElementById('pageTitle').textContent = titleMap[type] || '下单';
}

document.getElementById?.addEventListener || (function(){});

function toggleServiceFields(type) {
  const expressFields = document.getElementById('expressFields');
  const expressSize = document.getElementById('expressSize');
  const printFields = document.getElementById('printFields');
  const printCount = document.getElementById('printCount');
  const courseFields = document.getElementById('courseFields');
  const handwritingFields = document.getElementById('handwritingFields');

  if (expressFields) expressFields.style.display = type === 'express' ? 'block' : 'none';
  if (expressSize) expressSize.style.display = type === 'express' ? 'block' : 'none';
  if (printFields) printFields.style.display = type === 'print' ? 'block' : 'none';
  if (printCount) printCount.style.display = type === 'print' ? 'block' : 'none';
  if (courseFields) courseFields.style.display = type === 'course' ? 'block' : 'none';
  if (handwritingFields) handwritingFields.style.display = type === 'handwriting' ? 'block' : 'none';
}

function updatePrice() {
  const serviceType = document.getElementById('serviceType').value;
  let price = 0;

  switch(serviceType) {
    case 'express':
      const size = document.getElementById('packageSize').value;
      if (size === 'small') price = 3;
      else if (size === 'medium') price = 5;
      else price = 8;
      break;
    case 'print':
      const pages = parseInt(document.getElementById('printPages').value) || 1;
      price = pages * 0.5;
      break;
    case 'course':
      price = 50;
      break;
    case 'handwriting':
      price = 10;
      break;
  }

  document.getElementById('totalPrice').textContent = `￥${price.toFixed(2)}`;
  toggleServiceFields(serviceType);
}

function submitOrder() {
  const serviceType = document.getElementById('serviceType').value;
  const phone = document.getElementById('phone').value.trim();
  const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
  const remark = document.getElementById('remark').value.trim();

  if (!phone) {
    alert('请输入手机号码');
    return;
  }
  if (!/^1\d{10}$/.test(phone)) {
    alert('请输入正确的手机号码');
    return;
  }

  let description = '';
  let price = 0;

  switch(serviceType) {
    case 'express':
      const expressAddress = document.getElementById('expressAddress').value.trim();
      const size = document.getElementById('packageSize').value;
      const sizeMap = { small: '小件', medium: '中件', large: '大件' };
      const priceMap = { small: 3, medium: 5, large: 8 };
      description = `快递地址：${expressAddress}\n包裹大小：${sizeMap[size]}`;
      price = priceMap[size];
      break;
    case 'print':
      const printReq = document.getElementById('printRequirement').value.trim();
      const pages = parseInt(document.getElementById('printPages').value) || 1;
      description = `打印要求：${printReq}\n页数：${pages}张`;
      price = pages * 0.5;
      break;
    case 'course':
      const courseName = document.getElementById('courseName').value.trim();
      description = `课程名称：${courseName}`;
      price = 50;
      break;
    case 'handwriting':
      const hwContent = document.getElementById('handwritingContent').value.trim();
      description = `代写内容：${hwContent}`;
      price = 10;
      break;
  }

  if (deliveryAddress) {
    description += `\n送达地址：${deliveryAddress}`;
  }
  if (remark) {
    description += `\n备注：${remark}`;
  }

  const order = {
    id: generateOrderNo(),
    serviceType,
    serviceName: SERVICE_NAMES[serviceType],
    description,
    price: parseFloat(price.toFixed(2)),
    phone,
    deliveryAddress,
    status: 'paid',
    createdAt: Date.now(),
    agentId: null,
    agentName: null,
    acceptedAt: null,
    completedAt: null
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  localStorage.setItem('last_phone', phone);

  alert('下单成功！');
  window.location.href = 'my-orders.html';
}

let currentFilter = 'all';
let currentPhone = '';

function initMyOrdersPage() {
  initData();
  currentPhone = localStorage.getItem('last_phone') || '';
  if (currentPhone) {
    document.getElementById('queryPhone').value = currentPhone;
  }
  queryOrders();
}

function queryOrders() {
  const phone = document.getElementById('queryPhone').value.trim();
  currentPhone = phone;
  if (phone) {
    localStorage.setItem('last_phone', phone);
  }
  renderOrders();
}

function filterOrders(status) {
  currentFilter = status;
  document.querySelectorAll('.tab').forEach((tab, index) => {
    const statuses = ['all', 'pending', 'paid', 'completed'];
    tab.classList.toggle('active', statuses[index] === status);
  });
  renderOrders();
}

function renderOrders() {
  const orderList = document.getElementById('orderList');
  let orders = getOrders();

  if (currentPhone) {
    orders = orders.filter(o => o.phone === currentPhone);
  } else {
    orders = [];
  }

  if (currentFilter !== 'all') {
    orders = orders.filter(o => {
      if (currentFilter === 'pending') return o.status === 'pending';
      if (currentFilter === 'paid') return o.status === 'paid' || o.status === 'processing';
      if (currentFilter === 'completed') return o.status === 'completed';
      return true;
    });
  }

  if (orders.length === 0) {
    orderList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>${currentPhone ? '暂无订单' : '请输入手机号查询订单'}</p>
        <button class="btn-primary" onclick="goHome()">去下单</button>
      </div>
    `;
    return;
  }

  orderList.innerHTML = orders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <span class="order-no">${order.id}</span>
        <span class="order-status status-${order.status}">${STATUS_NAMES[order.status]}</span>
      </div>
      <div class="order-body">
        <div>
          <div class="order-service">${order.serviceName}</div>
          <div class="order-time">${formatTime(order.createdAt)}</div>
        </div>
        <div class="order-amount">￥${order.price.toFixed(2)}</div>
      </div>
      ${order.agentName ? `<div style="font-size:12px;color:#999;margin-top:8px;">接单员：${order.agentName}</div>` : ''}
    </div>
  `).join('');
}

function adminLogin() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  if (!username || !password) {
    alert('请输入账号和密码');
    return;
  }

  const admin = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || '{}');
  if (admin.username === username && admin.password === password) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, username);
    window.location.href = 'admin.html';
  } else {
    alert('账号或密码错误');
  }
}

function adminLogout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  window.location.href = 'admin-login.html';
}

function checkAdminAuth() {
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN)) {
    window.location.href = 'admin-login.html';
  }
}

let currentAdminTab = 'dashboard';

function initAdminPage() {
  initData();
  checkAdminAuth();
  loadDashboard();
}

function switchAdminTab(tab) {
  currentAdminTab = tab;
  document.querySelectorAll('.menu-item').forEach((item, index) => {
    const tabs = ['dashboard', 'orders', 'agents', 'finance'];
    item.classList.toggle('active', tabs[index] === tab);
  });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');

  if (tab === 'dashboard') loadDashboard();
  if (tab === 'orders') loadAllOrders();
  if (tab === 'agents') loadAgents();
  if (tab === 'finance') loadFinance();
}

function loadDashboard() {
  const orders = getOrders();
  const agents = getAgents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => o.createdAt >= today.getTime());
  const totalIncome = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);

  document.getElementById('statTotalOrders').textContent = orders.length;
  document.getElementById('statTodayOrders').textContent = todayOrders.length;
  document.getElementById('statTotalIncome').textContent = `¥${totalIncome.toFixed(2)}`;
  document.getElementById('statAgentCount').textContent = agents.filter(a => a.status === 'active').length;

  const recentOrders = orders.slice(0, 5);
  document.getElementById('recentOrderList').innerHTML = recentOrders.length ? recentOrders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.serviceName}</td>
      <td>¥${order.price.toFixed(2)}</td>
      <td><span class="order-status status-${order.status}">${STATUS_NAMES[order.status]}</span></td>
      <td>${formatTime(order.createdAt)}</td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="text-align:center;color:#999;">暂无订单</td></tr>';
}

function loadAllOrders() {
  const statusFilter = document.getElementById('orderStatusFilter').value;
  const search = document.getElementById('orderSearch').value.trim().toLowerCase();

  let orders = getOrders();
  if (statusFilter !== 'all') {
    orders = orders.filter(o => o.status === statusFilter);
  }
  if (search) {
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(search) || 
      o.phone.includes(search)
    );
  }

  document.getElementById('allOrderList').innerHTML = orders.length ? orders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.serviceName}</td>
      <td>${order.phone}</td>
      <td>¥${order.price.toFixed(2)}</td>
      <td>${order.agentName || '-'}</td>
      <td><span class="order-status status-${order.status}">${STATUS_NAMES[order.status]}</span></td>
      <td>${formatTime(order.createdAt)}</td>
      <td>
        ${order.status === 'completed' ? '' : 
          order.status === 'processing' ? `<button class="btn-success" onclick="adminCompleteOrder('${order.id}')">完成</button>` :
          `<button class="btn-danger" onclick="adminCancelOrder('${order.id}')">取消</button>`
        }
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8" style="text-align:center;color:#999;">暂无订单</td></tr>';
}

function adminCancelOrder(orderId) {
  if (!confirm('确定取消该订单吗？')) return;
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index > -1) {
    orders[index].status = 'cancelled';
    saveOrders(orders);
    loadAllOrders();
  }
}

function adminCompleteOrder(orderId) {
  if (!confirm('确定标记为已完成吗？')) return;
  const orders = getOrders();
  const agents = getAgents();
  const index = orders.findIndex(o => o.id === orderId);
  if (index > -1) {
    orders[index].status = 'completed';
    orders[index].completedAt = Date.now();
    
    if (orders[index].agentId) {
      const agentIndex = agents.findIndex(a => a.id === orders[index].agentId);
      if (agentIndex > -1) {
        agents[agentIndex].orderCount = (agents[agentIndex].orderCount || 0) + 1;
        agents[agentIndex].totalIncome = (agents[agentIndex].totalIncome || 0) + orders[index].price * 0.9;
        saveAgents(agents);
      }
    }
    
    saveOrders(orders);
    loadAllOrders();
  }
}

function loadAgents() {
  const search = document.getElementById('agentSearch').value.trim().toLowerCase();
  let agents = getAgents();
  if (search) {
    agents = agents.filter(a => 
      a.name.toLowerCase().includes(search) || 
      a.phone.includes(search)
    );
  }

  document.getElementById('agentList').innerHTML = agents.length ? agents.map(agent => `
    <tr>
      <td>${agent.id}</td>
      <td>${agent.name}</td>
      <td>${agent.phone}</td>
      <td>${agent.orderCount || 0}</td>
      <td>¥${(agent.totalIncome || 0).toFixed(2)}</td>
      <td><span style="color:${agent.status === 'active' ? '#2f9e44' : '#e03131'}">${agent.status === 'active' ? '正常' : '禁用'}</span></td>
      <td>
        <button class="btn-outline" style="padding:4px 10px;font-size:12px;" onclick="toggleAgentStatus(${agent.id})">
          ${agent.status === 'active' ? '禁用' : '启用'}
        </button>
        <button class="btn-danger" style="padding:4px 10px;font-size:12px;margin-left:5px;" onclick="deleteAgent(${agent.id})">删除</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:#999;">暂无接单员</td></tr>';
}

function showAddAgentModal() {
  document.getElementById('addAgentModal').classList.add('show');
  document.getElementById('newAgentName').value = '';
  document.getElementById('newAgentPhone').value = '';
  document.getElementById('newAgentPassword').value = '123456';
}

function hideAddAgentModal() {
  document.getElementById('addAgentModal').classList.remove('show');
}

function addAgent() {
  const name = document.getElementById('newAgentName').value.trim();
  const phone = document.getElementById('newAgentPhone').value.trim();
  const password = document.getElementById('newAgentPassword').value.trim();

  if (!name || !phone) {
    alert('请填写完整信息');
    return;
  }

  const agents = getAgents();
  if (agents.some(a => a.phone === phone)) {
    alert('该手机号已存在');
    return;
  }

  const newAgent = {
    id: Date.now(),
    name,
    phone,
    password: password || '123456',
    status: 'active',
    orderCount: 0,
    totalIncome: 0
  };

  agents.push(newAgent);
  saveAgents(agents);
  hideAddAgentModal();
  loadAgents();
  alert('添加成功');
}

function toggleAgentStatus(agentId) {
  const agents = getAgents();
  const index = agents.findIndex(a => a.id === agentId);
  if (index > -1) {
    agents[index].status = agents[index].status === 'active' ? 'disabled' : 'active';
    saveAgents(agents);
    loadAgents();
  }
}

function deleteAgent(agentId) {
  if (!confirm('确定删除该接单员吗？')) return;
  let agents = getAgents();
  agents = agents.filter(a => a.id !== agentId);
  saveAgents(agents);
  loadAgents();
}

function loadFinance() {
  const orders = getOrders();
  const agents = getAgents();
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  const total = completedOrders.reduce((sum, o) => sum + o.price, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIncome = completedOrders.filter(o => o.completedAt >= today.getTime()).reduce((sum, o) => sum + o.price, 0);
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const monthIncome = completedOrders.filter(o => o.completedAt >= monthStart).reduce((sum, o) => sum + o.price, 0);
  
  const agentCost = agents.reduce((sum, a) => sum + (a.totalIncome || 0), 0);

  document.getElementById('financeTotal').textContent = `¥${total.toFixed(2)}`;
  document.getElementById('financeToday').textContent = `¥${todayIncome.toFixed(2)}`;
  document.getElementById('financeMonth').textContent = `¥${monthIncome.toFixed(2)}`;
  document.getElementById('financeAgentCost').textContent = `¥${agentCost.toFixed(2)}`;

  const sortedAgents = [...agents].sort((a, b) => (b.totalIncome || 0) - (a.totalIncome || 0));
  document.getElementById('agentRankList').innerHTML = sortedAgents.length ? sortedAgents.slice(0, 10).map((agent, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${agent.name}</td>
      <td>${agent.orderCount || 0}</td>
      <td>¥${(agent.totalIncome || 0).toFixed(2)}</td>
    </tr>
  `).join('') : '<tr><td colspan="4" style="text-align:center;color:#999;">暂无数据</td></tr>';
}

function agentLogin() {
  const phone = document.getElementById('agentPhone').value.trim();
  const password = document.getElementById('agentPassword').value.trim();

  if (!phone || !password) {
    alert('请输入手机号和密码');
    return;
  }

  const agents = getAgents();
  const agent = agents.find(a => a.phone === phone && a.password === password);
  
  if (agent) {
    if (agent.status !== 'active') {
      alert('账号已被禁用，请联系管理员');
      return;
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_AGENT, JSON.stringify(agent));
    window.location.href = 'agent.html';
  } else {
    alert('手机号或密码错误');
  }
}

function agentLogout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_AGENT);
  window.location.href = 'agent-login.html';
}

function getCurrentAgent() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_AGENT) || 'null');
}

function checkAgentAuth() {
  if (!getCurrentAgent()) {
    window.location.href = 'agent-login.html';
  }
}

let currentAgentTab = 'pool';

function initAgentPage() {
  initData();
  checkAgentAuth();
  const agent = getCurrentAgent();
  if (agent) {
    document.getElementById('agentName').textContent = agent.name;
    document.getElementById('agentPhone').textContent = agent.phone;
  }
  loadOrderPool();
}

function switchAgentTab(tab) {
  currentAgentTab = tab;
  document.querySelectorAll('.menu-item').forEach((item, index) => {
    const tabs = ['pool', 'myOrders', 'income'];
    item.classList.toggle('active', tabs[index] === tab);
  });
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`agent-tab-${tab}`).classList.add('active');

  if (tab === 'pool') loadOrderPool();
  if (tab === 'myOrders') loadMyAgentOrders();
  if (tab === 'income') loadMyIncome();
}

function loadOrderPool() {
  const filter = document.getElementById('poolServiceFilter').value;
  let orders = getOrders().filter(o => o.status === 'paid');
  
  if (filter !== 'all') {
    orders = orders.filter(o => o.serviceType === filter);
  }

  const poolList = document.getElementById('orderPoolList');
  if (orders.length === 0) {
    poolList.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">📭</div>
        <p>暂无待接单订单</p>
      </div>
    `;
    return;
  }

  poolList.innerHTML = orders.map(order => `
    <div class="pool-card">
      <div class="pool-card-header">
        <span class="pool-service">${order.serviceName}</span>
        <span class="pool-price">¥${order.price.toFixed(2)}</span>
      </div>
      <div class="pool-desc">${order.description.replace(/\n/g, '<br>')}</div>
      <div class="pool-footer">
        <span class="pool-time">${formatTime(order.createdAt)}</span>
        <button class="btn-primary" onclick="acceptOrder('${order.id}')">抢单</button>
      </div>
    </div>
  `).join('');
}

function acceptOrder(orderId) {
  if (!confirm('确定接这个订单吗？')) return;
  
  const agent = getCurrentAgent();
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index > -1 && orders[index].status === 'paid') {
    orders[index].status = 'processing';
    orders[index].agentId = agent.id;
    orders[index].agentName = agent.name;
    orders[index].acceptedAt = Date.now();
    saveOrders(orders);
    loadOrderPool();
    alert('接单成功！');
  }
}

function loadMyAgentOrders() {
  const agent = getCurrentAgent();
  const statusFilter = document.getElementById('myOrderStatusFilter').value;
  
  let orders = getOrders().filter(o => o.agentId === agent.id);
  if (statusFilter !== 'all') {
    orders = orders.filter(o => o.status === statusFilter);
  }

  document.getElementById('myAgentOrderList').innerHTML = orders.length ? orders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.serviceName}</td>
      <td>¥${order.price.toFixed(2)}</td>
      <td>${order.phone}</td>
      <td><span class="order-status status-${order.status}">${STATUS_NAMES[order.status]}</span></td>
      <td>${order.acceptedAt ? formatTime(order.acceptedAt) : '-'}</td>
      <td>
        ${order.status === 'processing' ? `<button class="btn-success" onclick="completeMyOrder('${order.id}')">完成</button>` : '-'}
      </td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:#999;">暂无订单</td></tr>';
}

function completeMyOrder(orderId) {
  if (!confirm('确定已完成该订单吗？')) return;
  
  const agent = getCurrentAgent();
  const orders = getOrders();
  const agents = getAgents();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index > -1 && orders[index].agentId === agent.id) {
    orders[index].status = 'completed';
    orders[index].completedAt = Date.now();
    
    const agentIndex = agents.findIndex(a => a.id === agent.id);
    if (agentIndex > -1) {
      agents[agentIndex].orderCount = (agents[agentIndex].orderCount || 0) + 1;
      agents[agentIndex].totalIncome = (agents[agentIndex].totalIncome || 0) + orders[index].price * 0.7;
      saveAgents(agents);
      
      const updatedAgent = agents[agentIndex];
      localStorage.setItem(STORAGE_KEYS.CURRENT_AGENT, JSON.stringify(updatedAgent));
    }
    
    saveOrders(orders);
    loadMyAgentOrders();
    alert('订单已完成！');
  }
}

function loadMyIncome() {
  const agent = getCurrentAgent();
  const orders = getOrders().filter(o => o.agentId === agent.id && o.status === 'completed');
  
  const total = orders.reduce((sum, o) => sum + o.price * 0.9, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => o.completedAt >= today.getTime());
  const todayIncome = todayOrders.reduce((sum, o) => sum + o.price * 0.9, 0);
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const monthOrders = orders.filter(o => o.completedAt >= monthStart);
  const monthIncome = monthOrders.reduce((sum, o) => sum + o.price * 0.9, 0);

  document.getElementById('myTotalIncome').textContent = `¥${total.toFixed(2)}`;
  document.getElementById('myTodayIncome').textContent = `¥${todayIncome.toFixed(2)}`;
  document.getElementById('myMonthIncome').textContent = `¥${monthIncome.toFixed(2)}`;
  document.getElementById('myOrderCount').textContent = orders.length;

  document.getElementById('incomeDetailList').innerHTML = orders.length ? orders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.serviceName}</td>
      <td>¥${(order.price * 0.9).toFixed(2)}</td>
      <td>${order.completedAt ? formatTime(order.completedAt) : '-'}</td>
    </tr>
  `).join('') : '<tr><td colspan="4" style="text-align:center;color:#999;">暂无收入</td></tr>';
}

initData();
