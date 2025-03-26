<script setup>
  import { ref, onMounted, nextTick, computed, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import { createHanziWriter } from '../utils/hanziWriter'
  import RightNav from '../components/RightNav.vue'
  import { loadResource } from '../utils/resourceLoader'
  import QRCodeModal from '../components/QRCodeModal.vue'
  import StrokeOrderModal from '../components/StrokeOrderModal.vue'
  import { addToCart } from '../store/cart'
  import { useQuizStore } from '../store/quiz'
  import { message } from '../utils/message'
  import ZoomControls from '../components/ZoomControls.vue'

  // 创建统一的汉字书写器配置
  const createHanziWriterWithConfig = (targetId, char, size, onComplete) => {
    return createHanziWriter(targetId, char, {
      width: size,
      height: size,
      padding: Math.floor(size * 0.025),
      drawingWidth: Math.floor(quizSettings.value.drawingWidth),
      strokeMatchingThreshold: 0.6,
      onMistake: () => handleStrokeError(),
      onLoadCharDataSuccess: charData => {
        if (!charData) {
          // 数据加载失败，使用fallback模式
          writer.value = null
          const target = document.getElementById(targetId)
          target.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
              <div style="font-size: 200px; font-family: KaiTi, 楷体, STKaiti, 华文楷体, serif; margin-bottom: 10px;">${char}</div>
              <div style="color: #666; font-size: 14px;">笔顺数据不存在</div>
              <button
                style="margin-top: 20px; padding: 8px 16px; background-color: #4a5568; color: white; border-radius: 4px; cursor: pointer;"
                onclick="document.getElementById('next-char-btn').click()"
              >
                下一个
              </button>
            </div>
          `
          // 添加一个隐藏的按钮用于触发下一个字符
          const nextButton = document.createElement('button')
          nextButton.id = 'next-char-btn'
          nextButton.style.display = 'none'
          nextButton.onclick = () => {
            quizStore.setCurrentCharIndex(currentCharIndex.value + 1)
            showNextChar()
          }
          target.appendChild(nextButton)
          return
        }
        writer.value.quiz()
      },
      onComplete
    })
  }

  const router = useRouter()
  const route = useRoute()
  const writer = ref(null)
  const showModal = ref(false) // 控制笔顺组件的显示
  const quizStore = useQuizStore()

  // 从 store 中获取状态
  const inputText = computed({
    get: () => quizStore.inputText,
    set: value => (quizStore.inputText = value)
  })
  const currentChar = computed(() => quizStore.currentChar)
  const isPlaying = computed(() => quizStore.isPlaying)
  const isFinished = computed(() => quizStore.isFinished)
  const showQuiz = computed(() => quizStore.showQuiz)
  const errorCount = computed(() => quizStore.errorCount)
  const errorChars = computed(() => quizStore.errorChars)
  const progress = computed(() => quizStore.progress)
  const allChars = computed(() => quizStore.allChars)
  const currentCharIndex = computed(() => quizStore.currentCharIndex)
  const quizData = computed(() => quizStore.quizData)
  const activeTab = computed(() => quizStore.activeTab)
  const quizHistory = computed(() => quizStore.quizHistory)
  const quizSettings = computed(() => quizStore.quizSettings)

  // 检测是否在 Electron 环境中运行
  const isElectron = navigator.userAgent.toLowerCase().indexOf('electron') > -1

  const loadQuizData = async () => {
    try {
      const data = await loadResource('quiz.json')
      quizStore.quizData = data.data
    } catch (error) {
      console.error('加载作业数据失败:', error)
    }
  }

  const switchTab = tab => {
    quizStore.setActiveTab(tab)
    router.push({
      query: { ...route.query, tab }
    })
  }

  const handleSubmit = () => {
    // 将输入文本按行分割，过滤空行
    const lines = inputText.value.split('\n').filter(line => line.trim())
    // 过滤非汉字字符并限制每行字数和总行数
    const filteredLines = lines
      .map(line =>
        Array.from(line)
          .filter(char => /[\u4e00-\u9fa5]/.test(char))
          .slice(0, quizSettings.value.maxCharsPerLine)
          .join('')
      )
      .filter(line => line.length > 0)
      .slice(0, quizSettings.value.maxLines)

    if (quizStore.setQuizContent(filteredLines)) {
      quizStore.saveQuizHistory(filteredLines)
      showNextChar()
    }
  }

  const handleAddErrorCharsToCart = () => {
    // 遍历错误字Map，将每个字符添加到购物车
    errorChars.value.forEach((count, char) => {
      addToCart(char)
    })
    // 显示添加成功的提示
    message.success(`已将${errorChars.value.size}个错误汉字添加到练习列表`)
  }

  const startQuizFromContent = content => {
    if (quizStore.setQuizContent(content)) {
      quizStore.saveQuizHistory(content, 0, true)
      showNextChar()
    }
  }

  onMounted(() => {
    window.addEventListener('resize', updateContainerSize)
    quizStore.loadQuizSettings()
    updateContainerSize()
    loadQuizData()
    quizStore.loadQuizHistory()
    handleRouteChange()
  })

  const createConfetti = () => {
    const confettiContainer = document.createElement('div')
    confettiContainer.className = 'fixed inset-0 w-full h-full pointer-events-none z-[1000]'

    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-pink-500']
    const sizes = ['w-2.5 h-2.5', 'w-3.5 h-3.5', 'w-3 h-3', 'w-4 h-4', 'w-3.5 h-3.5']
    const delays = ['delay-0', 'delay-200', 'delay-400', 'delay-600', 'delay-800']

    for (let i = 0; i < 200; i++) {
      const confetti = document.createElement('div')
      const colorIndex = i % colors.length
      const xOffset = (Math.random() - 0.5) * window.innerWidth
      const yOffset = (Math.random() - 0.5) * window.innerHeight
      const rotation = Math.random() * 720

      confetti.className = `
        fixed left-1/2 top-1/2 rounded-full
        ${colors[colorIndex]} ${sizes[colorIndex]} ${delays[colorIndex]}
        animate-confetti-explode opacity-0
        transform -translate-x-1/2 -translate-y-1/2
      `
      confetti.style.setProperty('--tw-translate-x', `calc(-50% + ${xOffset}px)`)
      confetti.style.setProperty('--tw-translate-y', `calc(-50% + ${yOffset}px)`)
      confetti.style.setProperty('--tw-rotate', `${rotation}deg`)
      confettiContainer.appendChild(confetti)
    }

    document.body.appendChild(confettiContainer)
  }

  const handleStrokeError = () => {
    quizStore.handleStrokeError(currentChar.value)
  }

  const showNextChar = async () => {

    if (
      currentCharIndex.value >= allChars.value[progress.value.current].length
    ) {
      quizStore.setProgress(progress.value.current + 1)
      quizStore.setCurrentCharIndex(0)
    }

    const char = allChars.value[progress.value.current][currentCharIndex.value]
    quizStore.setCurrentChar(char)
    quizStore.setIsPlaying(true)

    await nextTick()
    const target = document.getElementById('character-target')
    if (target) {
      target.innerHTML = ''
      writer.value = createHanziWriterWithConfig('character-target', char, containerSize.value, () => {
        quizStore.setIsPlaying(false)
        const nextCharIndex = currentCharIndex.value + 1
        const isLastCharInLine = nextCharIndex >= allChars.value[progress.value.current].length
        const isLastLine = progress.value.current === progress.value.total - 1

        if (isLastCharInLine && isLastLine) {
          quizStore.setProgress(progress.value.total)
          quizStore.setCurrentCharIndex(nextCharIndex)
          setTimeout(() => {
            quizStore.setIsFinished(true)
            createConfetti()
            quizStore.saveQuizHistory(
              allChars.value.map(line => line.join('')),
              errorCount.value
            )
          }, 500)
        } else {
          quizStore.setCurrentCharIndex(nextCharIndex)
          showNextChar()
        }
      })
      writer.value.quiz()
    }
  }

  const resetQuiz = () => {
    inputText.value = ''
    quizStore.setCurrentChar('')
    quizStore.setIsPlaying(false)
    quizStore.setIsFinished(false)
    quizStore.setShowQuiz(false)
    quizStore.setProgress({ current: 0, total: 0 })
    quizStore.setAllChars([])
    quizStore.setCurrentCharIndex(0)
    quizStore.setErrorCount(0)
    quizStore.errorChars.clear()
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
  watch(inputText, newValue => {
    if (newValue) {
      const encodedContent = btoa(encodeURIComponent(newValue))
      router.replace(`/quiz/${encodedContent}`)
    }
  })

  // 监听路由参数变化
  watch(
    () => [
      route.params.content,
      route.query.reload,
      route.query.tab,
      route.path
    ],
    (
      [newContent, reload, newTab, newPath] = [],
      [oldContent, , , oldPath] = []
    ) => {
      newTab = newTab || '自由'
      quizStore.setActiveTab(newTab)
      // 当路由切换回 quiz 路径时，重置状态
      if (newPath !== oldPath && newPath.startsWith('/quiz')) {
        resetQuiz()
        handleRouteChange()
      } else if (newContent && (newContent !== oldContent || reload)) {
        resetQuiz()
        handleRouteChange()
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
    quizStore.loadQuizSettings()
    updateContainerSize()
    loadQuizData()
    quizStore.loadQuizHistory()
    handleRouteChange()
    handleAutoStart()
  })

  // 监听路由变化
  watch(
    () => route.params.content,
    () => {
      handleRouteChange()
    }
  )
  const zoomIn = () => {
    if (containerSize.value < maxSize) {
      containerSize.value = Math.min(containerSize.value + sizeStep, maxSize)
      // 保存新的尺寸设置到 localStorage
      localStorage.setItem(
        'quizSettings',
        JSON.stringify({ containerSize: containerSize.value })
      )
      if (writer.value) {
        const target = document.getElementById('character-target')
        if (target) {
          target.innerHTML = ''
          writer.value = createHanziWriterWithConfig('character-target', currentChar.value, containerSize.value, () => {
            quizStore.setIsPlaying(false)
            const nextCharIndex = currentCharIndex.value + 1
            const isLastCharInLine = nextCharIndex >= allChars.value[progress.value.current].length
            const isLastLine = progress.value.current === progress.value.total - 1

            if (isLastCharInLine && isLastLine) {
              quizStore.setCurrentCharIndex(nextCharIndex)
              quizStore.setProgress(progress.value.total)
              setTimeout(() => {
                quizStore.setIsFinished(true)
                createConfetti()
                quizStore.saveQuizHistory(
                  allChars.value.map(line => line.join('')),
                  errorCount.value
                )
              }, 500)
            } else {
              quizStore.setCurrentCharIndex(nextCharIndex)
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
      localStorage.setItem(
        'quizSettings',
        JSON.stringify({ containerSize: containerSize.value })
      )
      if (writer.value) {
        const target = document.getElementById('character-target')
        if (target) {
          target.innerHTML = ''
          writer.value = createHanziWriterWithConfig('character-target', currentChar.value, containerSize.value, () => {
            quizStore.setIsPlaying(false)
            const nextCharIndex = currentCharIndex.value + 1
            const isLastCharInLine = nextCharIndex >= allChars.value[progress.value.current].length
            const isLastLine = progress.value.current === progress.value.total - 1

            if (isLastCharInLine && isLastLine) {
              quizStore.setCurrentCharIndex(nextCharIndex)
              quizStore.setProgress(progress.value.total)
              setTimeout(() => {
                quizStore.setIsFinished(true)
                createConfetti()
                quizStore.saveQuizHistory(
                  allChars.value.map(line => line.join('')),
                  errorCount.value
                )
              }, 500)
            } else {
              quizStore.setCurrentCharIndex(nextCharIndex)
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
  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
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
    if (progress.value.total === 0) return 0
    return Math.round((progress.value.current / progress.value.total) * 100)
  })

  const formatRelativeTime = timestamp => {
    const now = new Date().getTime()
    const date = new Date(timestamp)
    const diff = now - date.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return `${Math.max(seconds, 0)}秒前`
    }
  }
  const totalCharsCount = computed(() => {
    return allChars.value.reduce((total, line) => total + line.length, 0)
  })
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a
          @click="
            () => {
              router.push('/quiz')
              quizStore.setActiveTab('自由')
              quizStore.resetState()
              if (writer) {
                writer.target.innerHTML = ''
                writer = null
              }
            }
          "
          style="
            font-size: 1.5rem;
            font-weight: bold;
            text-decoration: none;
            cursor: pointer;
          "
          >书空</a
        >
      </div>
    </div>
  </RightNav>
  <div class="w-full bg-gray-100 dark:bg-gray-800/30 border-b border-border" v-if="!showQuiz">
    <div class="flex gap-4">
      <button
        v-for="tab in ['自由', '练习', '历史']"
        :key="tab"
        :class="[
          'px-8 py-4 border-none bg-transparent text-text-color dark:text-gray-300 cursor-pointer text-base relative transition-all duration-300',
          {
            'text-primary-500 dark:text-primary-500 after:content-[\'\'] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-0.5 after:bg-primary-500-color after:transition-all after:duration-300': activeTab === tab,
            'hover:text-primary-500/80 hover:bg-primary-500-color/5 dark:hover:text-primary-500/80 dark:hover:bg-primary-500-color/5': activeTab !== tab
          }
        ]"
        @click="switchTab(tab)"
      >
        {{ tab }}
      </button>
    </div>
  </div>
  <div
    v-if="showQuiz && (progress.current > 0 || currentCharIndex > 0)"
    class="w-full"
  >
    <div class="h-0.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
      <div
        class="h-full bg-green-500 transition-all duration-300 ease-in-out"
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>
    <div class="h-0.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
      <div
        class="h-full bg-green-500 transition-all duration-300 ease-in-out"
        :style="{ width: (currentCharIndex / allChars[progress.current >= progress.total ? progress.total - 1 : progress.current].length * 100) + '%' }"
      ></div>
    </div>
  </div>
  <div class="container flex justify-center mx-auto">
    <div v-if="!showQuiz" class="content-section max-w-full md:max-w-2/3 w-full md:w-2/3 p-8">
      <div v-show="activeTab === '自由'" class="input-section">
        <div class="relative w-full overflow-hidden rounded-lg p-0.5">
          <div class="absolute -top-[450%] -bottom-[450%] -left-1/2 -right-1/2 z-0 animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#00ff00,#0088ff,#ff0000)] rounded-lg"></div>
          <textarea
            v-model="inputText"
            placeholder="请输入汉字，每行一个词"
            class="relative z-10 w-full p-4 -mb-1.5 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg border-none focus:outline-none"
            rows="5"
          ></textarea>
        </div>

        <div class="flex justify-center items-center gap-4 mt-6">
          <button
            @click="handleSubmit"
            class="cursor-pointer w-40 px-6 py-2.5 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-base font-medium"
          >
            开始书空
          </button>
          <div class="relative">
            <input
              type="file"
              accept=".txt"
              @change="handleFileUpload"
              class="hidden"
              id="file-upload"
            />
            <label
              for="file-upload"
              class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 cursor-pointer"
            >
              <i class="fas fa-upload"></i>
            </label>
          </div>
          <button
            v-if="!isElectron"
            @click="copyCurrentUrl"
            class="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <i class="fas fa-link"></i>
          </button>
          <button
            v-if="!isElectron"
            @click="generateQRCode"
            class="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <i class="fas fa-qrcode"></i>
          </button>
        </div>

        <div class="mt-8 p-5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-500 shadow-sm">
          <ul class="list-decimal ml-5 text-sm text-left">
            <li class="mb-2.5 text-gray-600 dark:text-gray-400 leading-relaxed">
              书空是跟随笔画在空中练习汉字书写的方法，本工具可以模拟书空，帮助孩子学习汉字笔顺，提高书写规范性。
            </li>
            <li class="mb-2.5 text-gray-600 dark:text-gray-400 leading-relaxed">
              一行一个词，设置中可以修改支持的行数和每行的字数，超出部分会被忽略。
            </li>
            <li class="mb-2.5 text-gray-600 dark:text-gray-400 leading-relaxed">上传按钮支持读取文本文件，格式相同。</li>
            <li v-if="!isElectron" class="text-gray-600 dark:text-gray-400 leading-relaxed">
              复制链接和生成二维码用于分享书空链接或二维码给其他人书空。
            </li>
          </ul>
        </div>
      </div>
      <div v-show="activeTab === '练习'" class="homework-section">
        <ul class="homework-list">
          <li
            v-for="(item, index) in quizData"
            :key="index"
            class="border border-gray-200 dark:text-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4 flex justify-center cursor-pointer bg-white dark:bg-gray-900/30 hover:bg-green-100 dark:hover:bg-gray-800/40 transition-colors"
            @click="startQuizFromContent(item.content)"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>

      <div v-show="activeTab === '历史'" class="p-4">
        <div class="flex justify-end mb-4">
          <button
            @click="quizStore.clearHistory"
            class="cursor-pointer px-4 py-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors flex items-center gap-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            v-if="quizHistory.length > 0"
          >
            <i class="fas fa-trash"></i> 清空历史
          </button>
        </div>
        <div v-if="quizHistory.length === 0" class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <p class="text-lg mb-4">还没有任何书空练习记录</p>
          <button @click="quizStore.setActiveTab('自由')" class="flex items-center gap-2 px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors">
            <i class="fas fa-plus"></i> 创建书空练习
          </button>
        </div>
        <ul v-else class="space-y-4">
          <li
            v-for="(item, index) in [...quizHistory].sort(
              (a, b) => new Date(b.startTime) - new Date(a.startTime)
            )"
            :key="index"
            class="dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-500 dark:hover:border-green-400 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800/50"
            @click="startQuizFromContent(item.content)"
          >
          <div class="flex justify-between items-start mb-2">
              <div class="flex flex-col gap-1">
                <span class="text-gray-500 dark:text-gray-400 text-sm">{{
                  formatRelativeTime(item.startTime)
                }}</span>
                <div class="text-gray-700 dark:text-gray-300 mt-1">
                  <span class="text-sm" :class="{'text-red-500' : item.errorCount > 0}">错误：{{ item.errorCount || 0 }}个</span>
                  <span class="text-sm ml-4">字数：{{ item.content.join('').length }}个</span>
                </div>
              </div>
              <div class="text-green-500 hover:text-green-600 transition-colors">
                <i class="fas fa-play"></i>
              </div>


            </div>
            <div class="history-content">
              {{
                item.content.join('，').slice(0, 10) +
                (item.content.join('，').length > 10 ? '...' : '')
              }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto space-y-6">
      <div v-if="!isFinished" class="flex justify-center items-center gap-3 text-2xl font-medium mb-2 overflow-x-auto py-2 w-full">
        <div
          v-for="(char, index) in visibleChars"
          :key="index"
          :class="[
            `px-3 py-1 rounded transition-all duration-200 text-gray-700 dark:text-gray-300`,
            { 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold': allChars[progress.current][currentCharIndex] === char }
          ]"
        >
          {{ char }}
        </div>
      </div>

      <template v-if="!isFinished">
        <ZoomControls
          :container-size="containerSize"
          :min-size="minSize"
          :max-size="maxSize"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
        />

      </template>


      <div v-if="!isFinished" class="w-full flex justify-center items-center bg-white dark:bg-gray-800  p-4 ">
        <div id="character-target" class="w-full h-full flex justify-center"></div>
      </div>

      <div v-else class="w-full flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-8  space-y-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-4">恭喜完成所有书空练习！</h2>
        <p class="text-lg text-gray-700 dark:text-gray-300">
          本次共书空
          <span class="text-green-500 font-bold">{{ totalCharsCount }}</span>
          字，错误
          <span class="text-red-500 font-bold">{{ errorCount }}</span> 次。
        </p>
        <div v-if="errorChars.size > 0" class="w-full bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-bold text-lg text-gray-800 dark:text-gray-300 mb-3">错误字统计</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-gray-600 dark:text-gray-400">
            <div
              v-for="[char, count] in errorChars"
              :key="char"
              class="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 cursor-pointer transition-colors duration-200"
              @click="
                () => {
                  quizStore.setCurrentChar(char)
                  showModal = true
                }
              "
            >
              <div class="text-2xl mb-1">{{ char }}</div>
              <div class="text-sm font-bold">{{ count }}</div>
            </div>
          </div>
        </div>
        <div class="flex gap-4 mt-4">
          <button title="重新开始" @click="resetQuiz" class="cursor-pointer px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 text-base font-medium">
            重新开始
          </button>
          <button
            title="练习错字"
            v-if="errorChars.size > 0"
            @click="handleAddErrorCharsToCart"
            class="cursor-pointer px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-base font-medium flex items-center gap-2"
          >
            <i class="fas fa-pencil-alt"></i>
            <span>练习错字</span>
          </button>
        </div>
      </div>
      <StrokeOrderModal
        v-model:show="showModal"
        :character="currentChar || ''"
      />
    </div>
  </div>
  <QRCodeModal v-model:show="showQRCode" :url="qrCodeUrl" />
</template>
