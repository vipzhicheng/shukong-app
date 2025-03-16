<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { createHanziWriter } from '../utils/hanziWriter'
import { isSpeechSupported } from '../store/speech'
import { addToCart, countTotalCharacters } from '../store/cart'
import { message } from '../utils/message'
import RightNav from '../components/RightNav.vue'

const route = useRoute()
const router = useRouter()
const inputText = ref('')
const currentChar = ref('')
const charList = ref([])
const writer = ref(null)
const isPlaying = ref(true)
const isFinished = ref(false)

const handleQuery = () => {
  const chars = Array.from(inputText.value).filter(char => {
    return /[一-龥]/.test(char)
  })

  if (chars.length > 0) {
    router.push(`/query/${encodeURIComponent(chars.join(''))}`)
  }
}

const openBaiduHanyu = () => {
  window.open(`https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`, '_blank', 'noopener,noreferrer')
}

// 语音设置
const voiceSettings = ref({
  defaultVoice: '',
  speakRate: 0.1
})

// 从 localStorage 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('voiceSettings')
  if (savedSettings) {
    voiceSettings.value = JSON.parse(savedSettings)
  }
}

const playSound = () => {
  if (!isSpeechSupported.value) return
  const utterance = new SpeechSynthesisUtterance(currentChar.value)
  utterance.lang = 'zh-CN'
  // 获取选中的语音
  const selectedVoice = window.speechSynthesis.getVoices().find(voice => voice.name === voiceSettings.value.defaultVoice)
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }
  utterance.rate = voiceSettings.value.speakRate || 0.1
  window.speechSynthesis.speak(utterance)
}

const onAnimationComplete = () => {
  isPlaying.value = false
  isFinished.value = true
}

const showCharacter = async (char) => {
  // 销毁旧的实例
  if (writer.value) {
    writer.value.cancelQuiz()
    writer.value.hideCharacter()
    writer.value = null
  }

  currentChar.value = char
  await nextTick()
  const target = document.getElementById('character-target')
  if (target) {
    target.innerHTML = ''
    writer.value = createHanziWriter('character-target', char, {
      onLoadCharDataSuccess: (charData) => {
        if (!charData) {
          // 数据加载失败，使用fallback模式
          writer.value = null
          target.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <div class="fallback-character" style="
                width: 300px;
                height: 300px;
                font-size: 200px;
                font-family: KaiTi, 楷体, STKaiti, 华文楷体, serif;
                display: flex;
                align-items: center;
                justify-content: center;
              ">${char}</div>
              <div style="color: #666; font-size: 14px;">笔顺数据不存在</div>
            </div>
          `
          isPlaying.value = false
          isFinished.value = true
          return
        }
        writer.value.animateCharacter({ onComplete: onAnimationComplete })
        isPlaying.value = true
        isFinished.value = false
      }
    })
  }
}

const togglePlay = () => {
  if (!writer.value) return

  if (isPlaying.value) {
    writer.value.pauseAnimation()
    isPlaying.value = false
  } else {
    if (!isFinished.value) {
      writer.value.resumeAnimation()
    } else {
      writer.value.animateCharacter({ onComplete: onAnimationComplete })
      isFinished.value = false
    }
    isPlaying.value = true
  }
}

const resetAnimation = () => {
  if (writer.value) {
    writer.value.animateCharacter({ onComplete: onAnimationComplete })

    setTimeout(() => {
      isFinished.value = false
      isPlaying.value = true
    }, 300)
  }
}

const handleAddToCart = () => {
  if (countTotalCharacters() >= 1000) {
    message.error('书空笔顺练习最多只能添加 1000 个字')
    return
  }
  if (addToCart(currentChar.value)) {
    message.success(`已添加到笔顺练习`)
  } else {
    message.error(`本次没有添加任何字，可能是之前已经添加过了。`)
  }
}

const updateCharList = async (chars) => {
  charList.value = Array.from(decodeURIComponent(chars || '')).filter(char => {
    return /[\u4e00-\u9fa5]/.test(char)
  })

  if (charList.value.length > 0) {
    currentChar.value = charList.value[0]
  } else {
    charList.value = ['无']
    currentChar.value = '无'
  }
  await showCharacter(currentChar.value)
}

watch(() => route.params.chars, async (newChars) => {
  await updateCharList(newChars)
})

onMounted(async () => {
  loadSettings()
  await updateCharList(route.params.chars)
})
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold;">笔顺查询</a>
      </div>
    </div>
  </RightNav>
  <div class="container">
    <div v-if="!route.params.chars" class="input-section">
      <div class="rainbow-border-container">
      <input
        v-model="inputText"
        placeholder="请输入汉字"
        class="input-field"
        @keyup.enter="handleQuery"
      />
    </div>
      <button @click="handleQuery" class="query-button">查询笔顺</button>
    </div>
    <div v-else class="result-section">
      <div class="character-list">
        <button
          v-for="char in charList"
          :key="char"
          @click="showCharacter(char)"
          :class="{ active: char === currentChar }"
          class="char-button"
        >
          {{ char }}
        </button>
      </div>
      <div id="character-target" class="character-display"></div>
      <div class="control-buttons">
        <button @click="togglePlay" class="control-button">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button @click="resetAnimation" class="control-button">
          <i class="fas fa-redo"></i>
        </button>
        <button @click="openBaiduHanyu" class="control-button">
          <i class="fas fa-search"></i>
        </button>
        <button v-if="isSpeechSupported" @click="playSound" class="control-button">
          <i class="fas fa-volume-up"></i>
        </button>
        <button v-if="writer" @click="handleAddToCart" class="control-button">
          <i class="fas fa-pencil-alt"></i>
        </button>
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

.input-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  max-width: 500px;
  padding: 20px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  z-index: 10;
  background-color: var(--bg-color);
}

.input-field {
  flex: 1;
  padding: 12px 18px;
  width: 80%;
  font-size: 24px;
  border: none;
  border-radius: 5px;
  background-color: var(--bg-color);
  color: var(--text-color);
  margin: 2px;
  outline: none;
}

.query-button {
  padding: 12px 24px;
  font-size: 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .input-section {
    flex-direction: column;
  }

  .query-button {
    width: 100%;
  }
}

.query-button:hover {
  background-color: #45a049;
}

.result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.character-list {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.char-button {
  padding: 8px 16px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.char-button:hover {
  background-color: #45a049;
}

.char-button.active {
  background-color: #45a049;
}

.character-display {
  width: 300px;
  height: 300px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.control-button {
  padding: 8px 16px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  background-color: #45a049;
}
</style>