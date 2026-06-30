import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { authApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoggedIn = ref(false)

  async function login(phone: string, password: string) {
    const res = await authApi.login(phone, password)
    if (res.code === 0 && res.data) {
      token.value = res.data.token
      user.value = res.data.user
      isLoggedIn.value = true
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return true
    }
    return false
  }

  async function register(phone: string, code: string, password: string) {
    const res = await authApi.register(phone, code, password)
    if (res.code === 0 && res.data) {
      token.value = res.data.token
      user.value = res.data.user
      isLoggedIn.value = true
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      return true
    }
    return false
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await authApi.getUserInfo()
      if (res.code === 0 && res.data) {
        user.value = res.data
        isLoggedIn.value = true
        localStorage.setItem('user', JSON.stringify(res.data))
      }
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function init() {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      user.value = JSON.parse(storedUser)
      isLoggedIn.value = true
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUserInfo,
    init
  }
})
