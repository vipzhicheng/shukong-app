<script setup>
  import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import { createHanziWriter } from '../utils/hanziWriter'
  import { isSpeechSupported } from '../store/speech'
  import { addToCart, countTotalCharacters } from '../store/cart'
  import { message } from '../utils/message'
  import RightNav from '../components/RightNav.vue'
  import wordbook from '../store/wordbook'
  import { clearQueryHistory, addQueryHistory, latestQueries, frequentQueries } from '../store/queryHistory'

  const route = useRoute()
  const router = useRouter()
  const inputText = ref('')
  const currentChar = ref('')
  const charList = ref([])
  const currentIndex = ref(0)
  const writer = ref(null)
  const isPlaying = ref(true)
  const isFinished = ref(false)

  const handleQuery = () => {
    const chars = Array.from(inputText.value).filter(char => {
      return /[\u4e00-\u9fa5]/.test(char)
    })

    if (chars.length > 0) {
      const query = chars.join('')
      addQueryHistory(query)
      router.push(`/query/${encodeURIComponent(query)}`)
    }
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

  const handleToggleWordbook = () => {
    wordbook.toggle(currentChar.value)
    if (wordbook.isInWordbook(currentChar.value)) {
      message.success('已添加到生字本')
    } else {
      message.success('已从生字本移除')
    }
  }

  const updateCharList = async chars => {
    charList.value = Array.from(decodeURIComponent(chars || '')).filter(
      char => {
        return /[\u4e00-\u9fa5]/.test(char)
      }
    )

    if (charList.value.length > 0) {
      currentIndex.value = 0
      currentChar.value = charList.value[0]
    } else {
      charList.value = ['无']
      currentChar.value = '无'
      currentIndex.value = 0
    }
    await showCharacter(currentChar.value)
  }

  const handleKeydown = async event => {
    if (!route.params.chars || charList.value.length <= 1) return

    if (event.key === 'ArrowLeft') {
      currentIndex.value = (currentIndex.value - 1 + charList.value.length) % charList.value.length
      currentChar.value = charList.value[currentIndex.value]
      await showCharacter(currentChar.value)
    } else if (event.key === 'ArrowRight') {
      currentIndex.value = (currentIndex.value + 1) % charList.value.length
      currentChar.value = charList.value[currentIndex.value]
      await showCharacter(currentChar.value)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  watch(
    () => route.params.chars,
    async newChars => {
      await updateCharList(newChars)
    }
  )


  const handleClearHistory = () => {
    message.confirm({
      title: '确认清空',
      content: '确定要清空所有查询历史吗？',
      onOk: () => {
        clearQueryHistory()
        message.success('查询历史已清空')
      },
      onCancel: () => {}
    })
  }

  const handleHistoryClick = query => {
    addQueryHistory(query)
    router.push(`/query/${encodeURIComponent(query)}`)
  }

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
  <div class="max-w-3xl mx-auto px-5 py-5 mt-20">
    <div v-if="!route.params.chars" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-5 py-5 flex flex-col gap-4 z-10">
      <div class="flex flex-col sm:flex-row gap-4">
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
      <div class="bg-white dark:bg-gray-700 rounded-lg p-4 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">查询历史</h3>
          <button
            @click="handleClearHistory"
            class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-300 text-sm"
            title="清空历史"
          >
            清空查询历史
          </button>
        </div>
        <div v-if="latestQueries.length > 0 || frequentQueries.length > 0" class="space-y-4">
          <div v-if="latestQueries.length > 0" class="space-y-2">
            <h4 class="text-sm text-gray-600 dark:text-gray-400">最近查询</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="query in latestQueries"
                :key="query.query"
                @click="handleHistoryClick(query.query)"
                class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
              >
                {{ query.query }}
              </button>
            </div>
          </div>
          <div v-if="frequentQueries.length > 0" class="space-y-2">
            <h4 class="text-sm text-gray-600 dark:text-gray-400">热门查询</h4>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="query in frequentQueries"
                :key="query.query"
                @click="handleHistoryClick(query.query)"
                class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
              >
                {{ query.query }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 dark:text-gray-400 text-sm">
          暂无查询历史
        </div>
      </div>
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
        <button
          v-if="writer"
          @click="handleToggleWordbook"
          class="px-4 py-2 bg-primary-500 cursor-pointer text-white rounded hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center"
        >
          <i :class="wordbook.isInWordbook(currentChar) ? 'fas fa-star' : 'far fa-star'"></i>
        </button>
      </div>
    </div>
  </div>
</template>


