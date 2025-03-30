<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]" @click.self="handleClose">
      <div class="bg-background dark:bg-background-dark p-8 rounded-lg relative max-w-[90vw] max-h-[90vh] border border-border dark:border-border-dark text-text dark:text-text-dark">
        <button @click="handleClose" class="absolute right-4 top-2 text-2xl text-text dark:text-text-dark hover:text-primary-500 dark:hover:text-primary-500 transition-colors duration-300 cursor-pointer">
          &times;
        </button>
        <div id="character-target-modal" class="my-4 flex items-center justify-center"></div>
        <div class="flex justify-center gap-4 mt-4">
          <button
            @click="togglePlay"
            class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
            title="播放/暂停"
          >
            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
          <button
            @click="resetAnimation"
            class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
            title="重新播放"
          >
            <i class="fas fa-redo"></i>
          </button>
          <button
            v-if="isSpeechSupported"
            @click="playCharacterSound"
            class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
            title="播放读音"
          >
            <i class="fas fa-volume-up"></i>
          </button>
          <button
            v-if="writer && !isFallbackMode"
            @click="addToCartHandler"
            class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
            title="添加到笔顺练习"
          >
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button
            @click="toggleWordbook"
            class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
            title="加入/移出生字本"
          >
            <i :class="['far fa-star', { 'fas fa-star': isInWordbook }]"></i>
          </button>
          <button
            @click="goToDictMap"
            class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
            title="字典查询"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { createHanziWriter } from '../utils/hanziWriter'
  import { isSpeechSupported } from '../store/speech'
  import { addToCart } from '../store/cart'
  import { message } from '../utils/message'
  import wordbook from '../store/wordbook'
  import { useRouter } from 'vue-router'

  const router = useRouter()

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
  const isFallbackMode = ref(false)
  const isInWordbook = ref(false)
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
    updateWordbookStatus()
  }

  const updateWordbookStatus = () => {
    isInWordbook.value = wordbook.isInWordbook(props.character)
  }

  const toggleWordbook = () => {
    wordbook.toggle(props.character)
    updateWordbookStatus()
  }

  const handleClose = () => {
    emit('update:show', false)
    emit('close')
  }

  const goToDictMap = () => {
    router.push(`/dictmap/${props.character}`)
    handleClose()
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
    const selectedVoice = speechSynthesis
      .getVoices()
      .find(voice => voice.name === voiceSettings.value.defaultVoice)
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

    // 重置fallback模式状态
    isFallbackMode.value = false

    writer = createHanziWriter('character-target-modal', props.character, {
      width: 300,
      height: 300,
      padding: 5,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 500,
      onLoadCharDataSuccess: charData => {
        if (!charData) {
          // 数据加载失败，使用fallback模式
          isFallbackMode.value = true
          writer = null
          target.innerHTML = `<div class="flex flex-col items-center gap-2.5">
          <div class="w-[300px] h-[300px] text-[200px] font-kai flex items-center justify-center">${props.character}</div>
          <div class="text-text-secondary dark:text-text-secondary-dark text-sm">笔顺数据不存在</div>
        </div>`
          isPlaying.value = false
          return
        }
        writer.animateCharacter()
        isPlaying.value = true
      }
    })
  }

  watch(
    () => props.show,
    newVal => {
      if (newVal) {
        nextTick(() => {
          initWriter()
          // 根据自动播放设置决定是否播放语音
          if (voiceSettings.value.autoPlay) {
            playCharacterSound()
          }
        })
      }
    }
  )

  // 加载语音设置
  onMounted(() => {
    loadSettings()
  })

  watch(
    () => props.character,
    () => {
      if (props.show) {
        initWriter()
        updateWordbookStatus()
      }
    }
  )

  onUnmounted(() => {
    if (writer) {
      writer.hideCharacter()
      writer = null
    }
  })
</script>
