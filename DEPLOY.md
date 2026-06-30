# 校园综合服务平台 - 部署指南

## 🚀 一键部署到 Render（推荐，免费）

### 第1步：注册 GitHub 账号
1. 访问 https://github.com/signup 注册
2. 按提示完成注册

### 第2步：安装 Git
1. 访问 https://git-scm.com/download/win 下载
2. 双击安装，一路点"下一步"

### 第3步：上传代码到 GitHub
1. 在 GitHub 上点击右上角 "+" → "New repository"
2. 仓库名随便填（比如：campus-service），选 Public
3. 点 "Create repository"
4. 打开 PowerShell 或 CMD，进入项目目录，执行：
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin 你的仓库地址
git push -u origin main
```

### 第4步：注册 Render 并部署
1. 访问 https://render.com 注册（用 GitHub 账号登录最快）
2. 点击右上角 "New +" → "Web Service"
3. 选择你刚创建的 GitHub 仓库
4. 填写配置：
   - **Name**: 随便填（比如 my-campus-service）
   - **Region**: 选 Singapore（新加坡，速度快）
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. 点击 "Create Web Service"
6. 等待 3-5 分钟部署完成
7. 部署成功后，会给你一个网址（类似 `https://xxx.onrender.com`）

### 第5步：访问网站
- 学生端：直接打开网址
- 超级管理员后台：网址 + `/super-admin/login`
  - 默认账号：`13800138000`
  - 默认密码：`superadmin123`
- 业务员后台：网址 + `/agent/login`
  - 需要管理员先添加业务员账号

---

## ⚠️ 注意事项

### 关于数据存储
- 免费套餐的数据存在服务器文件中，服务器重启后数据可能丢失
- 如果需要长期保存数据，建议升级付费套餐或接入数据库

### 关于访问速度
- Render 免费套餐服务器在国外，国内访问可能有点慢
- 如果需要更快速度，可以考虑国内云服务器（阿里云、腾讯云等）

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动后端服务器
npm run server

# 构建生产版本
npm run build
```
