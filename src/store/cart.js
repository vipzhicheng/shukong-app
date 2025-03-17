import { ref } from 'vue'

export const cartItems = ref([])

// 创建全局状态
// 从 localStorage 加载购物车数据
export function loadCartItems() {
  const savedItems = localStorage.getItem('cartItems')
  if (savedItems) {
    cartItems.value = JSON.parse(savedItems)
  }
}

// 保存购物车数据到 localStorage
export function saveCartItems() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
}

// 添加汉字到购物车
export function addToCart(character) {
  // 检查是否已存在
  if (!cartItems.value.includes(character)) {
    if (countTotalCharacters() >= 1000) {
      return false
    }

    cartItems.value.push(character)
    saveCartItems()
  } else {
    return false
  }

  return true
}

// 从购物车移除汉字
export function removeFromCart(character) {
  const index = cartItems.value.indexOf(character)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    saveCartItems()
  }
}

// 统计购物车中所有汉字的总数
export function countTotalCharacters() {
  return cartItems.value.reduce((total, item) => {
    // 使用正则表达式匹配汉字字符
    const chineseChars = Array.from(item).filter(char =>
      /[\u4e00-\u9fa5]/.test(char)
    )
    return total + chineseChars.length
  }, 0)
}

// 清空购物车
export function clearCart() {
  cartItems.value = []
  saveCartItems()
}
