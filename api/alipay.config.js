/**
 * 支付宝支付配置文件
 * 
 * 使用说明：
 * 1. 开通支付宝商家服务后，将下面的配置项替换为真实值
 * 2. 将 enabled 设置为 true 启用真实支付宝API
 * 3. 当前为模拟模式，系统会模拟支付成功（随机10%概率成功，用于测试）
 */

export const ALIPAY_CONFIG = {
  // 是否启用真实支付宝API（false为模拟模式）
  enabled: false,
  
  // 支付宝应用ID（在开放平台创建应用后获得）
  appId: 'your_alipay_app_id_here',
  
  // 应用私钥（PKCS1格式，需与公钥成对生成）
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
请在此处粘贴您的应用私钥
-----END RSA PRIVATE KEY-----`,
  
  // 支付宝公钥（在开放平台上传应用公钥后获得）
  publicKey: `-----BEGIN PUBLIC KEY-----
请在此处粘贴支付宝公钥
-----END PUBLIC KEY-----`,
  
  // 支付宝网关地址
  // 正式环境：https://openapi.alipay.com/gateway.do
  // 沙箱环境：https://openapi.alipaydev.com/gateway.do
  gateway: 'https://openapi.alipay.com/gateway.do',
  
  // 支付回调通知地址（需要公网可访问）
  notifyUrl: ''
}

export const PAY_VERIFY_CONFIG = {
  // 支付超时时间（分钟）
  timeoutMinutes: 30,
  
  // 前端轮询间隔（秒）
  pollIntervalSeconds: 5,
  
  // 启用自动核验的服务类型
  autoVerifyForTypes: ['print', 'express', 'handwriting'],
  
  // 仅手动确认的服务类型（线下付款）
  manualVerifyForTypes: ['course']
}
