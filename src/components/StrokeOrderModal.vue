<template>
  <div v-if="show" class="modal" @click.self="handleClose">
    <div class="modal-content">
      <span class="close" @click="handleClose">&times;</span>
      <div id="character-target-modal" class="character-display"></div>
      <div class="control-buttons">
        <button @click="togglePlay" class="control-button" title="播放/暂停">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button @click="resetAnimation" class="control-button" title="重新播放">
          <i class="fas fa-redo"></i>
        </button>
        <button @click="openBaiduHanyu" class="control-button" title="查询汉子">
          <i class="fas fa-search"></i>
        </button>
        <button
          v-if="isSpeechSupported"
          class="control-button"
          @click="playCharacterSound"
          title="播放读音"
        >
          <i class="fas fa-volume-up"></i>
        </button>
        <button
          class="control-button"
          @click="addToCartHandler"
          title="添加到笔顺练习"
        >
          <i class="fas fa-pencil-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { createHanziWriter } from '../utils/hanziWriter'
import { isSpeechSupported } from '../store/speech'
import { addToCart } from '../store/cart'
import { message } from '../utils/message'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  character: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:show', 'close'])

const isPlaying = ref(false)
let writer = null

// 语音设置
const voiceSettings = ref({
  defaultVoice: '',
  speakRate: 0.1,
  autoPlay: false
})

// 从 localStorage 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('voiceSettings')
  if (savedSettings) {
    voiceSettings.value = JSON.parse(savedSettings)
  }
}

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const togglePlay = () => {
  if (isPlaying.value) {
    writer?.pauseAnimation()
  } else {
    writer?.resumeAnimation()
  }
  isPlaying.value = !isPlaying.value
}

const resetAnimation = () => {
  writer?.animateCharacter()
  isPlaying.value = true
}

const openBaiduHanyu = () => {
  const url = `https://hanyu.baidu.com/s?wd=${props.character}&ptype=zici`
  window.open(url, '_blank')
}

const addToCartHandler = () => {

  if (addToCart(props.character)) {
    message.success(`已添加到书空笔顺练习`)
  } else {
    message.error(`本次没有添加任何字，可能是之前已经添加过了。`)
  }
}

const playCharacterSound = () => {
  if (!isSpeechSupported.value) return
  // 创建语音合成话语对象
  const utterance = new SpeechSynthesisUtterance(props.character)
  // 获取选中的语音
  const selectedVoice = speechSynthesis.getVoices().find(voice => voice.name === voiceSettings.value.defaultVoice)
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }
  utterance.rate = voiceSettings.value.speakRate || 0.1
  utterance.lang = 'zh-CN'
  // 播放语音
  speechSynthesis.speak(utterance)
}

const initWriter = () => {
  const target = document.getElementById('character-target-modal')
  if (!target) return

  if (writer) {
    writer.hideCharacter()
    writer = null
  }
  writer = createHanziWriter('character-target-modal', props.character, {
    width: 300,
    height: 300,
    padding: 5,
    showOutline: true,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 500,
    onLoadCharDataSuccess: () => {
      writer.animateCharacter()
      isPlaying.value = true
    }
  })
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      initWriter()
      // 根据自动播放设置决定是否播放语音
      if (voiceSettings.value.autoPlay) {
        playCharacterSound()
      }
    })
  }
})

// 加载语音设置
onMounted(() => {
  loadSettings()
})

watch(() => props.character, () => {
  if (props.show) {
    initWriter()
  }
})

onUnmounted(() => {
  if (writer) {
    writer.hideCharacter()
    writer = null
  }
})
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.close {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.character-display {
  margin: 1rem 0;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.control-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover {
  background: #f5f5f5;
}
</style>