<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { createHanziWriter } from '../utils/hanziWriter'

const route = useRoute()
const writer = ref(null)
const containerSize = ref(800)

const updateContainerSize = () => {
  const screenWidth = window.innerWidth
  if (screenWidth <= 768) {
    containerSize.value = screenWidth - 32 // 减去padding
  } else {
    containerSize.value = 800
  }
}

const initWriter = async (char) => {
  if (!char) return
  
  // 过滤非汉字字符，只取第一个汉字
  const hanziChar = char.match(/[\u4e00-\u9fa5]/)?.[0] || '无'
  
  await nextTick()
  const target = document.getElementById('character-display')
  if (!target) return
  
  target.innerHTML = ''
  updateContainerSize()
  
  writer.value = createHanziWriter('character-display', hanziChar, {
    width: containerSize.value,
    height: containerSize.value,
    padding: Math.floor(containerSize.value * 0.025),
    drawingWidth: Math.floor(containerSize.value * 0.03),
    strokeColor: '#333',
    startingColor: '#333',
    drawingColor: '#333',
    strokeFallbackWidth: Math.floor(containerSize.value * 0.03),
    strokeOrderVisible: true,
    strokeOrder: 'standard'
  })
  writer.value.animateCharacter()
}

watch(() => route.params.char, (char) => {
  if (char) {
    initWriter(decodeURIComponent(char))
  }
})

onMounted(() => {
  if (route.params.char) {
    initWriter(decodeURIComponent(route.params.char))
  }
  
  window.addEventListener('resize', () => {
    if (route.params.char) {
      initWriter(decodeURIComponent(route.params.char))
    }
  })
})
</script>

<template>
  <div id="character-display" class="character-container"></div>
</template>

<style scoped>
.character-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  border: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@media screen and (max-width: 768px) {
  .character-container {
    width: calc(100vw - 32px);
    height: calc(100vw - 32px);
  }
}
</style>