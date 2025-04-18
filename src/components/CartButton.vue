<template>
  <div
    v-if="!isHidden"
    class="cart-button fixed right-8 bottom-24 z-50 cursor-pointer"
    @click="toggleCart"
  >
    <div
      class="cart-button-inner relative w-12 h-12 flex justify-center items-center bg-gray-600 text-white p-4 rounded-full shadow-md transition-all duration-200 hover:bg-gray-700 hover:scale-105"
      title="开始笔顺练习"
    >
      <i class="fas fa-pencil-alt"></i>
      <span
        class="cart-button-count absolute -top-2 -right-0 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[18px] text-center"
      >
        {{ totolCount }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { cartItems, countTotalCharacters, clearCart } from '../store/cart'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '../store/quiz'
import { computed, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const quizStore = useQuizStore()

const totolCount = computed(() => countTotalCharacters())
// 定义不需要显示按钮的路由路径
const hiddenRoutes = [
  '/dictmap',
  '/play/stroke',
  '/settings',
  '/apps',
  '/help',
  '/about'
]

// 判断当前路由是否需要隐藏按钮
const isHidden = computed(() => {
  return hiddenRoutes.some(path => route.path.startsWith(path))
})

const toggleCart = () => {
  // 重置quiz状态
  quizStore.resetState()
  if (cartItems.value.length === 0) {
    router.push(`/quiz`)
  } else {
    // 将购物车中的汉字转换为文本内容
    const content = cartItems.value.join('\n')
    // 将文本内容转换为base64编码
    const encodedContent = btoa(encodeURIComponent(content))
    // 跳转到quiz页面，并带上编码后的内容
    router.push(`/quiz/${encodedContent}`)
  }

  clearCart()
}
</script>
