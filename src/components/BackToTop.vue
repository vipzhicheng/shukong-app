<template>
  <div
    v-show="showButton"
    class="back-to-top fixed right-8 bottom-40 z-50 cursor-pointer"
    @click="scrollToTop"
  >
    <div
      class="back-to-top-inner relative w-12 h-12 flex justify-center items-center bg-gray-600 text-white p-4 rounded-full shadow-md transition-all duration-200 hover:bg-gray-700 hover:scale-105"
      title="回到顶部"
    >
      <i class="fas fa-arrow-up"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)

const checkScroll = () => {
  showButton.value = window.scrollY > window.innerHeight
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>