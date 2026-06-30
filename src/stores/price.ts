import { defineStore } from 'pinia'
import { ref } from 'vue'
import { publicApi } from '@/api'

export const usePriceStore = defineStore('price', () => {
  const prices = ref<any>({})
  const loaded = ref(false)

  async function fetchPrices() {
    try {
      const res = await publicApi.getServicePrices()
      if (res.code === 0) {
        prices.value = res.data || {}
        loaded.value = true
      }
    } catch (e) {
      console.error('获取服务价格失败', e)
    }
  }

  function getPrice(key: string, defaultValue: string | number = '0'): number {
    const val = prices.value[key]
    if (val === undefined || val === null) return Number(defaultValue)
    return parseFloat(String(val)) || Number(defaultValue)
  }

  return {
    prices,
    loaded,
    fetchPrices,
    getPrice
  }
})
