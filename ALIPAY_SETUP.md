# 支付宝当面付开通及配置教程

## 重要提示

开通支付宝当面付需要**营业执照**，个人用户无法开通。
如果您没有营业执照，当前系统的**模拟模式**也可以正常使用，只是支付状态需要管理员手动确认。

---

## 一、开通支付宝当面付

### 步骤1：注册支付宝开放平台账号
1. 访问 https://open.alipay.com/
2. 使用企业支付宝账号登录（需营业执照）
3. 完成开发者认证

### 步骤2：创建网页/移动应用
1. 进入「控制台」→「网页/移动应用」
2. 点击「创建应用」
3. 填写应用名称、应用类型等信息
4. 提交审核（一般1-3个工作日）

### 步骤3：生成密钥对
**方法一：使用支付宝密钥生成工具（推荐）**
1. 下载支付宝密钥生成工具：https://opendocs.alipay.com/common/02kipl
2. 安装后打开工具
3. 点击「生成密钥」，自动生成应用公钥和应用私钥
4. 保存好生成的密钥文件

**方法二：使用OpenSSL命令行**
```bash
# 生成应用私钥
openssl genrsa -out app_private_key.pem 2048

# 从私钥提取公钥
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem
```

### 步骤4：配置应用密钥
1. 在开放平台应用详情页，找到「接口加签方式」
2. 选择「公钥」模式
3. 将上一步生成的**应用公钥**复制粘贴进去
4. 保存后会生成「支付宝公钥」，复制保存好

### 步骤5：开通当面付功能
1. 在应用详情页，找到「产品绑定」
2. 点击「绑定产品」
3. 搜索「当面付」并申请开通
4. 提交营业执照等资料，等待审核
5. 审核通过后即可使用

---

## 二、配置到系统中

### 步骤1：安装支付宝SDK
```bash
cd 刷课网站程序
npm install alipay-sdk --save
```

### 步骤2：修改配置文件
编辑 `api/alipay.config.js` 文件：

```javascript
export const ALIPAY_CONFIG = {
  // 1. 启用真实支付宝API
  enabled: true,
  
  // 2. 填入你的应用ID
  appId: '你的应用ID',
  
  // 3. 填入应用私钥（完整的RSA私钥）
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
你的应用私钥内容
-----END RSA PRIVATE KEY-----`,
  
  // 4. 填入支付宝公钥
  publicKey: `-----BEGIN PUBLIC KEY-----
支付宝公钥内容
-----END PUBLIC KEY-----`,
  
  // 正式环境网关，不要改
  gateway: 'https://openapi.alipay.com/gateway.do',
}
```

### 步骤3：修改server.js引入配置
在 `api/server.js` 中，将原来的 `ALIPAY_CONFIG` 和 `PAY_VERIFY_CONFIG` 常量替换为从配置文件导入：

```javascript
import { ALIPAY_CONFIG, PAY_VERIFY_CONFIG } from './alipay.config.js'
```

### 步骤4：添加AlipaySdk导入
在 `api/server.js` 顶部添加：
```javascript
import AlipaySdk from 'alipay-sdk'
```

---

## 三、测试流程

### 沙箱环境测试（推荐先测沙箱）
1. 支付宝开放平台提供沙箱环境：https://open.alipay.com/develop/sandbox/app
2. 将配置中的 gateway 改为沙箱地址：`https://openapi.alipaydev.com/gateway.do`
3. 使用沙箱买家账号测试支付
4. 测试无误后再切换到正式环境

### 测试步骤
1. 启动后端服务：`npm run server`
2. 启动前端服务：`npm run dev`
3. 用户下单 → 扫码支付 → 查看是否自动核验成功
4. 管理员后台「支付流水」页面查看支付记录

---

## 四、常见问题

### Q: 提示"商户未开通当面付"
A: 请确认已在开放平台申请并开通当面付产品，审核通过才能使用。

### Q: 签名验证失败
A: 检查私钥和公钥是否正确，注意不要有多余的空格或换行。

### Q: 订单查询不到
A: 确认转账备注中填写了正确的订单号，系统是根据订单号查询交易的。

### Q: 没有营业执照怎么办
A: 
1. 可以继续使用当前的**模拟模式**，由管理员手动确认收款
2. 办理个体户营业执照（费用低，办理快，一般几百元）
3. 找有营业执照的朋友公司挂靠（注意资金安全风险）

---

## 五、接口说明

系统使用的支付宝接口：
- `alipay.trade.query`：交易查询接口，根据商户订单号查询交易状态
- 文档地址：https://opendocs.alipay.com/open/02ekfh

查询参数：
- `out_trade_no`：商户订单号（即系统生成的订单号）

返回关键字段：
- `code`：状态码，10000表示成功
- `trade_status`：交易状态，TRADE_SUCCESS表示支付成功
- `total_amount`：交易金额
- `trade_no`：支付宝交易号

---

## 六、安全提示

1. **私钥安全**：应用私钥是最重要的凭证，绝不能泄露，不要上传到代码仓库
2. **金额校验**：系统会校验实际到账金额与订单金额是否一致
3. **防重复处理**：同一订单只会执行一次支付成功逻辑，避免重复更新
4. **超时机制**：30分钟内未支付的订单自动取消，避免占用资源
