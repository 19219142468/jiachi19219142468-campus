import { useUserStore } from '@/stores/user'

/**
 * 确保用户已登录，未登录则用手机号自动登录
 * @param phone 手机号
 * @returns 是否已登录（true=已登录，false=登录失败）
 */
export async function ensureLoggedIn(phone: string): Promise<boolean> {
  const userStore = useUserStore()
  
  if (userStore.isLoggedIn) {
    return true
  }
  
  if (userStore.token) {
    return true
  }
  
  if (!/^1\d{10}$/.test(phone)) {
    return false
  }
  
  try {
    const success = await userStore.login(phone, '')
    return success
  } catch (e) {
    return false
  }
}
