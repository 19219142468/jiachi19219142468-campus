import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CartItem {
  type: 'print' | 'course'
  id: string
  name: string
  price: number
  quantity: number
  options?: any
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  function addPrintItem(item: Omit<CartItem, 'type' | 'id' | 'quantity'>) {
    const id = `print_${Date.now()}`
    items.value.push({
      type: 'print',
      id,
      name: item.name,
      price: item.price,
      quantity: 1,
      options: item.options
    })
  }

  function addCourseItem(item: Omit<CartItem, 'type' | 'id' | 'quantity'>) {
    const id = `course_${Date.now()}`
    items.value.push({
      type: 'course',
      id,
      name: item.name,
      price: item.price,
      quantity: 1,
      options: item.options
    })
  }

  function removeItem(id: string) {
    items.value = items.value.filter(item => item.id !== id)
  }

  function clearCart() {
    items.value = []
  }

  function getTotal() {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  return {
    items,
    addPrintItem,
    addCourseItem,
    removeItem,
    clearCart,
    getTotal
  }
})
