<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { createHanziWriter } from '../utils/hanziWriter'
import RightNav from '../components/RightNav.vue'
import { loadResource } from '../utils/resourceLoader'

const router = useRouter()
const inputText = ref('')
const currentChar = ref('')
const writer = ref(null)
const isPlaying = ref(false)
const isFinished = ref(false)
const showQuiz = ref(false)
const progress = ref({ current: 0, total: 0 })
const allChars = ref([])
const currentCharIndex = ref(0)
const quizData = ref([])

const loadQuizData = async () => {
  try {
    const data = await loadResource('quiz.json')
    quizData.value = data.data
  } catch (error) {
    console.error('加载作业数据失败:', error)
  }
}

const handleSubmit = () => {
  // 将输入文本按行分割，过滤空行
  const lines = inputText.value.split('\n').filter(line => line.trim())
  progress.value.total = lines.length
  progress.value.current = 0

  // 将每行文字转换为字符数组
  allChars.value = lines.map(line => Array.from(line))

  if (allChars.value.length > 0 && allChars.value[0].length > 0) {
    currentCharIndex.value = 0
    showQuiz.value = true
    showNextChar()
  }
}

const startQuizFromContent = (content) => {
  progress.value.total = content.length
  progress.value.current = 0
  allChars.value = content.map(word => Array.from(word))

  if (allChars.value.length > 0 && allChars.value[0].length > 0) {
    currentCharIndex.value = 0
    showQuiz.value = true
    showNextChar()
  }
}

const createConfetti = () => {
  const confettiContainer = document.createElement('div')
  confettiContainer.style.position = 'fixed'
  confettiContainer.style.top = '0'
  confettiContainer.style.left = '0'
  confettiContainer.style.width = '100%'
  confettiContainer.style.height = '100%'
  confettiContainer.style.pointerEvents = 'none'
  confettiContainer.style.zIndex = '1000'

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    // 为每个粒子设置随机的偏移量和旋转角度
    const xOffset = (Math.random() - 0.5) * window.innerWidth + 'px'
    const yOffset = (Math.random() - 0.5) * window.innerHeight + 'px'
    const rotation = Math.random() * 720 + 'deg'
    confetti.style.setProperty('--x-offset', xOffset)
    confetti.style.setProperty('--y-offset', yOffset)
    confetti.style.setProperty('--rotation', rotation)
    confettiContainer.appendChild(confetti)
  }

  document.body.appendChild(confettiContainer)
}

const showNextChar = async () => {
  if (currentCharIndex.value >= allChars.value[progress.value.current].length) {
    // 当前行的所有字符都完成了
    if (progress.value.current + 1 >= progress.value.total) {
      // 所有行都完成了
      isFinished.value = true
      createConfetti()
      return
    }
    progress.value.current++
    currentCharIndex.value = 0
  }

  const char = allChars.value[progress.value.current][currentCharIndex.value]
  currentChar.value = char
  isPlaying.value = true

  await nextTick()
  const target = document.getElementById('character-target')
  if (target) {
    target.innerHTML = ''
    writer.value = createHanziWriter('character-target', char, {
      width: containerSize.value,
      height: containerSize.value,
      padding: Math.floor(containerSize.value * 0.025),
      drawingWidth: Math.floor(containerSize.value * 0.03),
      onComplete: () => {
        isPlaying.value = false
        currentCharIndex.value++
        showNextChar()
      }
    })

    writer.value.quiz()
  }
}

const resetQuiz = () => {
  inputText.value = ''
  currentChar.value = ''
  isPlaying.value = false
  isFinished.value = false
  showQuiz.value = false
  progress.value = { current: 0, total: 0 }
  allChars.value = []
  currentCharIndex.value = 0
}

const containerSize = ref(500)
const minSize = 300
const maxSize = 800
const sizeStep = 50

const loadQuizSettings = () => {
  const savedSettings = localStorage.getItem('quizSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    containerSize.value = settings.containerSize
  }
}

const updateContainerSize = () => {
  const screenWidth = window.innerWidth
  if (screenWidth <= 768) {
    containerSize.value = screenWidth - 32 // 减去padding
  } else {
    // 使用保存的设置或默认值
    const savedSettings = localStorage.getItem('quizSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      containerSize.value = settings.containerSize
    } else {
      containerSize.value = 500
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', updateContainerSize)
  loadQuizSettings()
  updateContainerSize()
  loadQuizData()
})
const zoomIn = () => {
  if (containerSize.value < maxSize) {
    containerSize.value = Math.min(containerSize.value + sizeStep, maxSize)
    // 保存新的尺寸设置到 localStorage
    localStorage.setItem('quizSettings', JSON.stringify({ containerSize: containerSize.value }))
    if (writer.value) {
      const target = document.getElementById('character-target')
      if (target) {
        target.innerHTML = ''
        writer.value = createHanziWriter('character-target', currentChar.value, {
          width: containerSize.value,
          height: containerSize.value,
          padding: Math.floor(containerSize.value * 0.025),
          drawingWidth: Math.floor(containerSize.value * 0.03),
          onComplete: () => {
            isPlaying.value = false
            currentCharIndex.value++
            showNextChar()
          }
        })
        writer.value.quiz()
      }
    }
  }
}

const zoomOut = () => {
  if (containerSize.value > minSize) {
    containerSize.value = Math.max(containerSize.value - sizeStep, minSize)
    // 保存新的尺寸设置到 localStorage
    localStorage.setItem('quizSettings', JSON.stringify({ containerSize: containerSize.value }))
    if (writer.value) {
      const target = document.getElementById('character-target')
      if (target) {
        target.innerHTML = ''
        writer.value = createHanziWriter('character-target', currentChar.value, {
          width: containerSize.value,
          height: containerSize.value,
          padding: Math.floor(containerSize.value * 0.025),
          drawingWidth: Math.floor(containerSize.value * 0.03),
          onComplete: () => {
            isPlaying.value = false
            currentCharIndex.value++
            showNextChar()
          }
        })
        writer.value.quiz()
      }
    }
  }
}

  onMounted(() => {
    window.addEventListener('resize', updateContainerSize)
    updateContainerSize()
    loadQuizData()
  })
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold;">书空</a>
      </div>
    </div>
  </RightNav>
  <div class="container">
    <div v-if="!showQuiz" class="input-section">
      <p class="description">书空的目的是为了让学生记住笔顺。</p>
      <textarea
        v-model="inputText"
        placeholder="请输入汉字，每行一个词"
        class="input-field"
        rows="5"
      ></textarea>
      <button @click="handleSubmit" class="submit-button">开始书空</button>

      <div class="homework-section">
        <h3 class="homework-title">书空作业</h3>
        <ul class="homework-list">
          <li
            v-for="(item, index) in quizData"
            :key="index"
            class="homework-item"
            @click="startQuizFromContent(item.content)"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="quiz-section">
      <div class="progress-bar">
        进度: {{ progress.current + 1 }}/{{ progress.total }}
      </div>
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-button" :disabled="containerSize >= maxSize">
          <i class="fas fa-search-plus"></i>
        </button>
        <button @click="zoomOut" class="zoom-button" :disabled="containerSize <= minSize">
          <i class="fas fa-search-minus"></i>
        </button>
      </div>

      <div v-if="!isFinished" class="character-display">
        <div id="character-target"></div>
      </div>

      <div v-else class="completion-message">
        <h2>恭喜完成所有书空练习！</h2>
        <button @click="resetQuiz" class="reset-button">重新开始</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: var(--primary-color);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.description {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.input-field {
  width: 100%;
  max-width: 600px;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.submit-button,
.reset-button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: center;
}

.submit-button:hover,
.reset-button:hover {
  background-color: #45a049;
}

.quiz-section {
  text-align: center;
  position: fixed;
  top: calc(50% + 40px);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  min-width: 480px;
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
}

.character-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: v-bind(containerSize + 'px');
  height: v-bind(containerSize + 'px');
  background-color: var(--bg-color);
}

.completion-message {
  text-align: center;
  position: relative;
}

.completion-message h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 48px;
}

@media screen and (max-width: 768px) {
  .character-display {
    width: calc(100vw - 32px);
    height: calc(100vw - 32px);
  }
}
.homework-section {
  margin-top: 40px;
  width: 100%;
  max-width: 600px;
}

.homework-title {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.homework-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.homework-item {
  padding: 16px 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  color: var(--text-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.homework-item:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  background-color: #f00;
  left: 50%;
  top: 50%;
  animation: explode 2s ease-out forwards;
  --x-offset: 0px;
  --y-offset: 0px;
  --rotation: 0deg;
}

.confetti:nth-child(2n) {
  background-color: #0f0;
  animation-delay: 0.2s;
  width: 15px;
  height: 15px;
}

.confetti:nth-child(3n) {
  background-color: #00f;
  animation-delay: 0.4s;
  width: 12px;
  height: 12px;
}

.confetti:nth-child(4n) {
  background-color: #ff0;
  animation-delay: 0.6s;
  width: 18px;
  height: 18px;
}

.confetti:nth-child(5n) {
  background-color: #f0f;
  animation-delay: 0.8s;
  width: 14px;
  height: 14px;
}
</style>

<style>
@keyframes fallDown {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0.7;
  }
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(0.1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--x-offset)), calc(-50% + var(--y-offset))) scale(5) rotate(var(--rotation));
    opacity: 0;
  }
}

.progress-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 16px;
  z-index: 1000;
}

.zoom-controls {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
  visibility: v-bind(isFinished ? 'hidden' : 'visible');
}

.zoom-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.zoom-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

.zoom-button:disabled {
  background-color: rgba(0, 0, 0, 0.3);
  cursor: not-allowed;
}

.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  background-color: #f00;
  left: 50%;
  top: 50%;
  animation: explode 2s ease-out forwards;
  --x-offset: 0px;
  --y-offset: 0px;
  --rotation: 0deg;
}

.confetti:nth-child(2n) {
  background-color: #0f0;
  animation-delay: 0.2s;
  width: 15px;
  height: 15px;
}

.confetti:nth-child(3n) {
  background-color: #00f;
  animation-delay: 0.4s;
  width: 12px;
  height: 12px;
}

.confetti:nth-child(4n) {
  background-color: #ff0;
  animation-delay: 0.6s;
  width: 18px;
  height: 18px;
}

.confetti:nth-child(5n) {
  background-color: #f0f;
  animation-delay: 0.8s;
  width: 14px;
  height: 14px;
}
</style>