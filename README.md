# 校园综合服务平台 - 部署指南

## 项目概述

校园综合服务平台是一个面向在校学生的O2O服务平台，提供A4纸打印服务和网课学习服务。

## 技术栈

- **前端**: Vue3 + Vite + TailwindCSS + TypeScript
- **后端**: Express + Node.js + SQLite
- **数据库**: SQLite (轻量级，易于部署)

## 项目结构

```
d:\刷课网站程序\
├── src/                    # 前端源代码
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   ├── Login.vue      # 登录页
│   │   ├── Register.vue   # 注册页
│   │   ├── Print.vue      # 打印下单
│   │   ├── Course.vue     # 网课学习下单
│   │   ├── Order.vue      # 订单列表
│   │   ├── OrderDetail.vue # 订单详情
│   │   ├── Pay.vue        # 支付页
│   │   ├── Profile.vue    # 个人中心
│   │   ├── Addresses.vue  # 地址管理
│   │   ├── Balance.vue    # 余额管理
│   │   └── admin/         # 管理后台页面
│   ├── api/              # API调用封装
│   ├── stores/           # Pinia状态管理
│   ├── router/           # 路由配置
│   └── types/            # TypeScript类型定义
├── api/
│   └── server.ts         # 后端API服务器
├── package.json          # 项目依赖
└── vite.config.ts        # Vite配置
```

## 快速启动

### 1. 安装依赖

```bash
# 进入项目目录
cd d:\刷课网站程序

# 安装依赖
npm install
```

### 2. 启动后端服务器

```bash
# 启动后端API服务器 (端口3000)
npm run server
```

### 3. 启动前端开发服务器

```bash
# 新开一个终端，启动前端 (端口5173)
npm run dev
```

### 4. 访问应用

打开浏览器访问: http://localhost:5173

## 账号说明

### 管理员账号
- **手机号**: 13800138000
- **密码**: admin123
- **后台地址**: http://localhost:5173/admin

### 测试用户
注册新账号即可成为普通用户

## 功能模块

### 用户端功能
1. **注册/登录**: 手机号+验证码注册，密码登录
2. **打印服务**: 黑白0.2元/张，彩色0.3元/张，支持多种格式
3. **网课学习**: 2元/门，支持加急服务(+3元)
4. **订单管理**: 查看订单状态，支付/取消订单
5. **地址管理**: 添加/编辑/删除取货地址
6. **余额管理**: 充值、提现、查看交易明细

### 管理后台功能
1. **数据概览**: 今日订单、收入统计
2. **订单管理**: 查看所有订单，更新状态
3. **用户管理**: 查看用户，禁用/启用账号
4. **服务设置**: 修改打印/网课价格
5. **财务报表**: 查看收入支出统计
6. **提现管理**: 审核用户提现申请

## 支付配置

系统支持两种支付模式（可在管理后台切换）：

1. **直接到账模式**: 资金直接进入您的个人账户
2. **平台余额模式**: 资金进入平台账户，可申请提现

### BufPay个人免签接入

如需接入真实支付，需：
1. 注册 [BufPay](https://bufpay.com/) 账号
2. 获取AppID和AppKey
3. 在 `api/server.ts` 中配置支付接口

## 数据库

SQLite数据库文件: `data.db`（首次运行后自动创建）

### 主要数据表
- `users`: 用户表
- `addresses`: 地址表
- `orders`: 订单表
- `order_items`: 订单明细表
- `transactions`: 交易记录表
- `withdrawals`: 提现记录表
- `service_config`: 服务配置表

## 生产部署

### 前端打包

```bash
npm run build
```

构建产物在 `dist/` 目录

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### PM2启动后端

```bash
# 安装PM2
npm install -g pm2

# 启动后端
pm2 start api/server.ts --name campus-api

# 保存进程列表
pm2 save

# 设置开机启动
pm2 startup
```

## 注意事项

1. **验证码**: 开发环境验证码在控制台打印
2. **支付**: 当前为模拟支付，需接入真实支付接口
3. **文件上传**: 当前未实现真实文件存储，需配置OSS或本地存储
4. **安全**: 生产环境请修改JWT密钥和数据库配置

## 联系方式

如有问题，请联系开发者。
