<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { isSpeechSupported } from '../store/speech'
import { createHanziWriter } from '../utils/hanziWriter'

const route = useRoute()
const currentChar = ref('')
const charList = ref([])
const writer = ref(null)
const isPlaying = ref(true)
const isFinished = ref(false)
const showModal = ref(false)

const openBaiduHanyu = () => {
  window.open(`https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`, '_blank', 'noopener,noreferrer')
}

// 创建语音合成对象
const synth = window.speechSynthesis

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

// 播放汉字读音
const playCharacterSound = (char) => {
  if (!isSpeechSupported.value) return
  // 创建语音合成话语对象
  const utterance = new SpeechSynthesisUtterance(char)
  // 获取选中的语音
  const selectedVoice = synth.getVoices().find(voice => voice.name === voiceSettings.value.defaultVoice)
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }
  utterance.lang = 'zh-CN'
  utterance.rate = voiceSettings.value.speakRate || 0.1
  // 播放语音
  synth.speak(utterance)
}

onMounted(() => {
  loadSettings()
})

const onAnimationComplete = () => {
  console.log('动画完成')
  isPlaying.value = false
  isFinished.value = true
}

const showCharacter = async (char) => {
  currentChar.value = char
  showModal.value = true
  // 播放汉字读音
  playCharacterSound(char)
  await nextTick()
  const target = document.getElementById('character-target-modal')
  if (target) {
    target.innerHTML = ''
    writer.value = createHanziWriter('character-target-modal', char, {
      onLoadCharDataSuccess: () => {
        writer.value.animateCharacter({ onComplete: onAnimationComplete })
        isPlaying.value = true
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

const closeModal = () => {
  showModal.value = false
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
}

watch(() => route.params.chars, async (newChars) => {
  await updateCharList(newChars)
})

onMounted(async () => {
  await updateCharList(route.params.chars)
})
</script>

<template>
  <div class="container">
    <div v-if="charList.length > 0" class="result-section">
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
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <div id="character-target-modal" class="character-display"></div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.character-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  max-width: 100%;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.close {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  background: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.character-display {
  width: 300px;
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
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