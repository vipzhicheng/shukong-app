<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { createHanziWriter } from '../utils/hanziWriter'
import RightNav from '../components/RightNav.vue'
import { loadResource } from '../utils/resourceLoader'
import QRCode from 'qrcode.vue'
import StrokeOrderModal from '../components/StrokeOrderModal.vue'
import { addToCart } from '../store/cart'

const router = useRouter()
const route = useRoute()
const inputText = ref('')
const currentChar = ref('')
const writer = ref(null)
const isPlaying = ref(false)
const isFinished = ref(false)
const showQuiz = ref(false)
const errorCount = ref(0)
const errorChars = ref(new Map()) // 记录错误字及其次数
const showModal = ref(false) // 控制笔顺组件的显示
const progress = ref({ current: 0, total: 0 })
const allChars = ref([])
const currentCharIndex = ref(0)
const quizData = ref([])
const quizHistory = ref([])
const activeTab = ref(route.query.tab || '自由')



// 检测是否在 Electron 环境中运行
const isElectron = navigator.userAgent.toLowerCase().indexOf('electron') > -1;

const loadQuizData = async () => {
  try {
    const data = await loadResource('quiz.json')
    quizData.value = data.data
  } catch (error) {
    console.error('加载作业数据失败:', error)
  }
}

const quizSettings = ref({
  containerSize: 500,
  maxLines: 20,
  maxCharsPerLine: 5
})

const loadQuizSettings = () => {
  const savedSettings = localStorage.getItem('quizSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    containerSize.value = settings.containerSize
    quizSettings.value = settings
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  router.push({
    query: { ...route.query, tab }
  })
}

const loadQuizHistory = () => {
  const savedHistory = localStorage.getItem('quizHistory')
  if (savedHistory) {
    quizHistory.value = JSON.parse(savedHistory)
  }
}

const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    quizHistory.value = []
    localStorage.removeItem('quizHistory')
  }
}

const saveQuizHistory = (content, errors = 0) => {
  const currentHistory = quizHistory.value || []
  const newHistoryItem = {
    startTime: new Date().toISOString(),
    content: content,
    totalChars: content.reduce((acc, line) => acc + line.length, 0),
    errorCount: errors
  }
  currentHistory.unshift(newHistoryItem)
  quizHistory.value = currentHistory.slice(0, 10)
  localStorage.setItem('quizHistory', JSON.stringify(quizHistory.value))
}

const handleSubmit = () => {
  // 将输入文本按行分割，过滤空行
  const lines = inputText.value.split('\n').filter(line => line.trim())
  // 过滤非汉字字符并限制每行字数和总行数
  const filteredLines = lines
    .map(line => Array.from(line)
      .filter(char => /[\u4e00-\u9fa5]/.test(char))
      .slice(0, quizSettings.value.maxCharsPerLine)
      .join('')
    )
    .filter(line => line.length > 0)
    .slice(0, quizSettings.value.maxLines)

  progress.value.total = filteredLines.length
  progress.value.current = 0

  // 将每行文字转换为字符数组
  allChars.value = filteredLines.map(line => Array.from(line))

  if (allChars.value.length > 0 && allChars.value[0].length > 0) {
    currentCharIndex.value = 0
    showQuiz.value = true
    saveQuizHistory(filteredLines)
    showNextChar()
  }
}


const handleAddErrorCharsToCart = () => {
  // 遍历错误字Map，将每个字符添加到购物车
  errorChars.value.forEach((count, char) => {
    addToCart(char)
  })
  // 显示添加成功的提示
  alert(`已将${errorChars.value.size}个错误汉字添加到练习列表`)
}


const startQuizFromContent = (content) => {
  // 过滤非汉字字符并限制每行字数和总行数
  const filteredContent = content
    .map(line => Array.from(line.toString())
      .filter(char => /[\u4e00-\u9fa5]/.test(char))
      .slice(0, quizSettings.value.maxCharsPerLine)
      .join('')
    )
    .filter(line => line.length > 0)
    .slice(0, quizSettings.value.maxLines)

  progress.value.total = filteredContent.length
  progress.value.current = 0
  allChars.value = filteredContent.map(word => Array.from(word))

  if (allChars.value.length > 0 && allChars.value[0].length > 0) {
    currentCharIndex.value = 0
    showQuiz.value = true
    saveQuizHistory(filteredContent)
    showNextChar()
  }
}

onMounted(() => {
  window.addEventListener('resize', updateContainerSize)
  loadQuizSettings()
  updateContainerSize()
  loadQuizData()
  loadQuizHistory()
  handleRouteChange()
})

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

const handleStrokeError = () => {
  errorCount.value++
  // 记录当前错误字的次数
  const currentErrorCount = errorChars.value.get(currentChar.value) || 0
  errorChars.value.set(currentChar.value, currentErrorCount + 1)
}
const showNextChar = async () => {
  if (currentCharIndex.value >= allChars.value[progress.value.current].length) {
    // 当前行的所有字符都完成了
    progress.value.current++ // 提前更新进度
    if (progress.value.current >= progress.value.total) {
      // 所有行都完成了
      isFinished.value = true
      createConfetti()
      // 保存练习记录时包含错误次数
      saveQuizHistory(allChars.value.map(line => line.join('')), errorCount.value)
      return
    }
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
      drawingWidth: Math.floor(containerSize.value * 0.08),
      onComplete: () => {
        isPlaying.value = false
        currentCharIndex.value++
        showNextChar()
      },
      onMistake: handleStrokeError
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
  errorCount.value = 0
  errorChars.value.clear()
}

const containerSize = ref(500)
const minSize = 100
const maxSize = 800
const sizeStep = 50


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


// 监听路由参数变化
const handleRouteChange = () => {
  if (route.params.content) {
    try {
      const decodedContent = decodeURIComponent(atob(route.params.content))
      inputText.value = decodedContent
    } catch (error) {
      console.error('解析 URL 参数失败:', error)
    }
  }
}



// 监听输入文本变化，同步到 URL
watch(inputText, (newValue) => {
  if (newValue) {
    const encodedContent = btoa(encodeURIComponent(newValue))
    router.replace(`/quiz/${encodedContent}`)
  }
})

// 监听路由参数变化
watch(
  () => [route.params.content, route.query.reload],
  ([newContent, reload] = [], [oldContent] = []) => {
    if (newContent && (newContent !== oldContent || reload)) {
      resetQuiz();
      handleRouteChange();
      if (newContent) {
        router.replace(`/quiz/${newContent}`)
      }

    }
  },
  { immediate: true }
)

// 只在组件首次加载时处理自动开始参数
const handleAutoStart = () => {
  if (route.query.autostart === '1' && route.params.content) {
    handleSubmit()
  }
}

onMounted(() => {
  window.addEventListener('resize', updateContainerSize)
  loadQuizSettings()
  updateContainerSize()
  loadQuizData()
  loadQuizHistory()
  handleRouteChange()
  handleAutoStart()
})

// 监听路由变化
watch(() => route.params.content, () => {
  handleRouteChange()
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
          drawingWidth: Math.floor(containerSize.value * 0.08),
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
          drawingWidth: Math.floor(containerSize.value * 0.08),
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
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      inputText.value = e.target.result
      handleSubmit()
    }
    reader.readAsText(file)
  }
}
const visibleChars = computed(() => {
  if (!allChars.value[progress.value.current]) return []
  const currentLineChars = allChars.value[progress.value.current]
  const remainingChars = currentLineChars.slice(currentCharIndex.value)
  // 如果剩余字符小于等于6个，显示所有剩余字符
  if (remainingChars.length <= 6) {
    return currentLineChars.slice(-6)
  }
  // 否则只显示前6个字符
  return remainingChars.slice(0, 6)
})
const showQRCode = ref(false)
const qrCodeUrl = ref('')

const generateQRCode = () => {
  const url = new URL(window.location.href)
  qrCodeUrl.value = url.toString() + '?autostart=1'
  showQRCode.value = true
}

const copyCurrentUrl = async () => {
  try {
    const url = window.location.href
    if (window.navigator.clipboard) {
      // 使用现代 Clipboard API
      await window.navigator.clipboard.writeText(url)
    } else {
      // 兼容性处理
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    alert('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制链接失败:', error)
    alert('复制链接失败，请手动复制')
  }
}
const progressPercentage = computed(() => {
  if (progress.value.total === 0) return 0;
  return Math.round((progress.value.current / progress.value.total) * 100);
});

const formatRelativeTime = (timestamp) => {
  const now = new Date().getTime();
  const date = new Date(timestamp);
  const diff = now - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return `${Math.max(seconds, 0)}秒前`;
  }
};
const totalCharsCount = computed(() => {
  return allChars.value.reduce((total, line) => total + line.length, 0)
})
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a @click="() => { router.push('/quiz'); activeTab = '自由'; showQuiz = false; isFinished = false; isPlaying = false; inputText = ''; currentChar = ''; currentCharIndex = 0; allChars = []; progress = { current: 0, total: 0 }; if (writer) { writer.target.innerHTML = ''; writer = null; } }" style="font-size: 1.5rem; font-weight: bold; text-decoration: none; cursor: pointer;">书空</a>
      </div>
    </div>
  </RightNav>
  <div class="tabs-container" v-if="!showQuiz">
    <div class="tabs">
      <button
        v-for="tab in ['自由', '练习', '历史']"
        :key="tab"
        :class="['tab-button', { active: activeTab === tab }]"
        @click="switchTab(tab)"
      >
        {{ tab }}
      </button>
    </div>
  </div>
  <div v-if="showQuiz && (progress.current > 0 || currentCharIndex > 0)" class="progress-bar">
    <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
  </div>
  <div class="container">
    <div v-if="!showQuiz" class="content-section">
      <div v-show="activeTab === '自由'" class="input-section">
        <div class="rainbow-border-container">
          <textarea
            v-model="inputText"
            placeholder="请输入汉字，每行一个词"
            class="input-field"
            rows="5"
          ></textarea>
        </div>

      <div class="button-group">
        <button @click="handleSubmit" class="submit-button">开始书空</button>
        <div class="file-upload">
          <input
            type="file"
            accept=".txt"
            @change="handleFileUpload"
            class="file-input"
            id="file-upload"
          />
          <label for="file-upload" class="file-label">
            <i class="fas fa-upload"></i>
          </label>
        </div>
        <button v-if="!isElectron" @click="copyCurrentUrl" class="copy-button">
          <i class="fas fa-link"></i>
        </button>
        <button v-if="!isElectron" @click="generateQRCode" class="qr-button">
          <i class="fas fa-qrcode"></i>
        </button>
      </div>

      <div class="note-box">
        <ul class="note-list">
          <li>书空是跟随笔画在空中练习汉字书写的方法，本工具可以模拟书空，帮助孩子学习汉字笔顺，提高书写规范性。</li>
          <li>一行一个词，设置中可以修改支持的行数和每行的字数，超出部分会被忽略。</li>
          <li>上传按钮支持读取文本文件，格式相同。</li>
          <li v-if="!isElectron">复制链接和生成二维码用于分享书空链接或二维码给其他人书空。</li>
        </ul>
      </div>
      </div>
      <div v-show="activeTab === '练习'" class="homework-section">
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

      <div v-show="activeTab === '历史'" class="history-section">
        <div class="history-header">
          <button @click="clearHistory" class="clear-history-button" v-if="quizHistory.length > 0">
            <i class="fas fa-trash"></i> 清空历史
          </button>
        </div>
        <div v-if="quizHistory.length === 0" class="empty-history">
          <p class="empty-history-text">还没有任何书空练习记录</p>
          <button @click="activeTab = '自由'" class="create-quiz-button mt-4">
            <i class="fas fa-plus"></i> 创建书空练习
          </button>
        </div>
        <ul v-else class="history-list">
          <li
            v-for="(item, index) in [...quizHistory].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))"
            :key="index"
            class="history-item"
            @click="startQuizFromContent(item.content)"
          >
            <div class="history-info">
              <div><span class="history-time">{{ formatRelativeTime(item.startTime) }}</span></div>
<div>
              <span class="history-chars" style="margin-right: 8px;">字数：{{ item.totalChars }}</span>
              <span class="history-errors" v-if="item.errorCount && item.errorCount > 0">错误：{{ item.errorCount }}</span></div>
            </div>
            <div class="history-content">
              {{ item.content.join('，').slice(0, 10) + (item.content.join('，').length > 10 ? '...' : '') }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="quiz-section">
      <div v-if="!isFinished" class="preview-chars">
        <div
          v-for="(char, index) in visibleChars"
          :key="index"
          :class="[`preview-char`, { active: allChars[progress.current][currentCharIndex] === char }]"
        >
          {{ char }}
        </div>
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
        <p>本次共书空 <span class="text-green-500 font-bold">{{totalCharsCount}}</span> 字，错误 <span class="text-red-500 font-bold">{{ errorCount }}</span> 次。</p>
        <div v-if="errorChars.size > 0" class="error-chars-grid">
          <h3 class="font-bold">错误字统计</h3>
          <div class="error-char-items">
            <div
              v-for="[char, count] in errorChars"
              :key="char"
              class="error-char-item"
              @click="() => {
                currentChar = char
                showModal = true
              }"
            >
              <div class="char">{{ char }}</div>
              <div class="count text-red-500 font-bold">{{ count }}</div>
            </div>
          </div>
        </div>
        <button title="重新开始" @click="resetQuiz" class="reset-button">重新开始</button>
        <button
          title="练习错字"
          v-if="errorChars.size > 0"
          @click="handleAddErrorCharsToCart"
          class="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          <i class="fas fa-pencil-alt"></i>
        </button>
      </div>
      <StrokeOrderModal
        v-model:show="showModal"
        :character="currentChar"
      />
    </div>
  </div>
  <!-- QR Code Modal -->
  <div v-if="showQRCode" class="qr-modal-overlay" @click="showQRCode = false">
    <div class="qr-modal" @click.stop>
      <div class="qr-modal-header">
        <button class="close-button" @click="showQRCode = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="qr-modal-content">
        <QRCode :value="qrCodeUrl" :size="200" level="H" />
        <h3 class="qr-modal-title">手机扫码书空练习</h3>
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
  position: relative;
}



.progress-bar-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
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
  margin:2px;
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  resize: vertical;
  position: relative;
  border: 4px solid transparent;
}


.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-button {
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #4CAF50;
}

.file-label {
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid #ddd;
}



.file-upload {
  position: relative;
  display: flex;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

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
  top: calc(50% + 60px);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  min-width: 480px;
  height: calc(100% - 120px);
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
  margin-bottom: 10px;
  width: v-bind(containerSize + 'px');
  height: v-bind(containerSize + 'px');
  background-color: var(--bg-color);
}

.completion-message {
  text-align: center;
  position: relative;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

.completion-message h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: clamp(24px, 6vw, 48px);
  word-wrap: break-word;
  line-height: 1.2;
}

.error-chars-grid {
  margin: 2rem 0;
}

.error-chars-grid h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.error-char-items {
  display: flex;
  flex-wrap: wrap;
  max-width: 800px;
  gap: 1rem;
  margin: 1rem auto;
  padding: 0 2rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-char-items {
    width: 100%;
    padding: 0 2rem;
  }
}

.error-char-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-char-item:hover {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.error-char-item .char {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.error-char-item .count {
}

@media screen and (max-width: 768px) {
  .character-display {
    width: calc(100vw - 32px);
    height: calc(100vw - 32px);
  }
}.progress-bar {
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.tabs-container {
  width: 100%;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 1rem;
  position: relative;
  transition: color 0.3s;
}

.tab-button.active {
  color: var(--primary-color);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.content-section {
  width: 100%;
}

.homework-section,
.history-section {
  width: 100%;
  max-width: 600px;
}

.history-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.clear-history-button {
  background-color: var(--danger-color, #dc3545);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.clear-history-button:hover {
  background-color: var(--danger-hover-color, #c82333);
}

.homework-title,
.history-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  text-align: center;
}

.homework-list,
.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.homework-item,
.history-item {
  padding: 1rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  color: var(--text-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.homework-item:hover,
.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.history-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.history-time,
.history-chars,
.history-errors {
  margin-right: 10px;
}

.history-errors {
  color: #ff4d4f;
}

.history-content {
  color: var(--text-color);
  font-size: 1rem;
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



.zoom-controls {
  position: fixed;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
  padding: 0.5rem;
}

.zoom-button {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-button:hover:not(:disabled) {
  background-color: var(--hover-color);
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

@media (max-width: 768px) {
  .zoom-controls {
    right: 40px;
  }
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

<style scoped>
.preview-chars {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-char {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bg-color);
}

.preview-char.active {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
  font-weight: bold;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
}
.copy-button {
  padding: 8px 16px;
  font-size: 16px;
  background-color: white;
  border: 1px solid #ddd;
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}


.qr-modal-title {
  margin-top: 20px;
}

.qr-button {
  padding: 8px 16px;
  font-size: 16px;
  color: var(--text-color);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;

}

.qr-label:hover {
  background-color: #f5f5f5;
}

.qr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.qr-modal {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 10px;
  width: 90%;
  max-width: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-modal-header {
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: -10px;
}

.qr-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-color);
  cursor: pointer;
  padding: 5px;
}

.close-button:hover {
  color: #666;
}

.qr-modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: var(--bg-color);
  border-radius: 4px;
  color: var(--text-color);
}

.note-box {
  margin-top: 2rem;
  padding: 1.25rem;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 0.75rem;
  border: 1px solid #4CAF50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.note-list {
  list-style-type: decimal;
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.9rem;
  text-align: left;
}

.note-list li {
  margin-bottom: 0.625rem;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.note-list li:last-child {
  margin-bottom: 0;
}
</style>