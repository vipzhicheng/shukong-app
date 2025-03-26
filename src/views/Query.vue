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
    window.open(
      `https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`,
      '_blank',
      'noopener,noreferrer'
    )
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
    const selectedVoice = window.speechSynthesis
      .getVoices()
      .find(voice => voice.name === voiceSettings.value.defaultVoice)
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

  const showCharacter = async char => {
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
        onLoadCharDataSuccess: charData => {
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

  const updateCharList = async chars => {
    charList.value = Array.from(decodeURIComponent(chars || '')).filter(
      char => {
        return /[\u4e00-\u9fa5]/.test(char)
      }
    )

    if (charList.value.length > 0) {
      currentChar.value = charList.value[0]
    } else {
      charList.value = ['无']
      currentChar.value = '无'
    }
    await showCharacter(currentChar.value)
  }

  watch(
    () => route.params.chars,
    async newChars => {
      await updateCharList(newChars)
    }
  )

  onMounted(async () => {
    loadSettings()
    await updateCharList(route.params.chars)
  })
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <router-link
          to="/query"
          class="text-2xl font-bold no-underline text-gray-800 transition-colors duration-300 hover:text-primbg-primary-500 cursor-pointer"
          >笔顺查询</router-link
        >
      </div>
    </div>
  </RightNav>
  <div class="max-w-3xl mx-auto px-5 py-5">
    <div v-if="!route.params.chars" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-5 py-5 flex flex-col sm:flex-row gap-4 z-10">
      <div class="flex-1 relative overflow-hidden rounded-lg p-0.5">
        <div class="absolute -top-[450%] -bottom-[450%] -left-1/2 -right-1/2 z-0 animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#00ff00,#0088ff,#ff0000)] rounded-lg"></div>
        <input
          v-model="inputText"
          placeholder="请输入汉字"
          class="relative z-10 w-full px-4 py-3 text-2xl bg-white dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-400 outline-none cursor-pointer transition-all duration-300 rounded-lg"
          @keyup.enter="handleQuery"
        />
      </div>
      <button
        @click="handleQuery"
        class="cursor-pointer px-6 py-3 text-2xl bg-primary-500 text-white rounded-lg hover:bg-opacity-90 transition-colors duration-300 whitespace-nowrap"
      >
        查询笔顺
      </button>
    </div>
    <div v-else class="flex flex-col items-center gap-5">
      <div class="flex flex-wrap gap-2.5 mb-5">
        <button
          v-for="char in charList"
          :key="char"
          @click="showCharacter(char)"
          :class="{ 'bg-opacity-90': char === currentChar }"
          class="px-4 py-2 text-base bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300"
        >
          {{ char }}
        </button>
      </div>
      <div id="character-target" class="w-[300px] h-[300px] border border-gray-300 dark:border-gray-800 rounded-lg"></div>
      <div class="flex gap-2.5 mt-5">
        <button
          @click="togglePlay"
          class="px-4 py-2 bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center"
        >
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button
          @click="resetAnimation"
          class="px-4 py-2 bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center"
        >
          <i class="fas fa-redo"></i>
        </button>
        <button
          @click="openBaiduHanyu"
          class="px-4 py-2 bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center"
        >
          <i class="fas fa-search"></i>
        </button>
        <button
          v-if="isSpeechSupported"
          @click="playSound"
          class="px-4 py-2 bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center"
        >
          <i class="fas fa-volume-up"></i>
        </button>
        <button
          v-if="writer"
          @click="handleAddToCart"
          class="px-4 py-2 bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center"
        >
          <i class="fas fa-pencil-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>


