<template>
  <div class="cart-button" @click="toggleCart">
    <div class="cart-icon" title="开始笔顺练习">
      <i class="fas fa-pencil-alt"></i>
      <span v-if="cartItems.length > 0" class="cart-count">{{ countTotalCharacters() }}</span>
    </div>
  </div>
</template>

<script setup>
import { cartItems, countTotalCharacters, clearCart } from '../store/cart'
import { useRouter } from 'vue-router'

const router = useRouter()

const toggleCart = () => {
  // 将购物车中的汉字转换为文本内容
  const content = cartItems.value.join('\n')
  // 将文本内容转换为base64编码
  const encodedContent = btoa(encodeURIComponent(content))
  // 跳转到quiz页面，并带上编码后的内容
  router.push(`/quiz/${encodedContent}?reload=1`)

  clearCart()
}
</script>

<style scoped>
.cart-button {
  position: fixed;
  right: 2rem;
  bottom: 6rem;
  z-index: 1000;
  cursor: pointer;
}

.cart-icon {
  position: relative;
  width:3rem;
  height:3rem;
  display:flex;
  justify-content: center;
  align-items: center;
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.cart-icon:hover {
  background-color: #2d3748;
  transform: scale(1.05);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: 0px;
  background-color: #e53e3e;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
}
</style>