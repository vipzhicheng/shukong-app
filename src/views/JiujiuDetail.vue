<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import RightNav from '../components/RightNav.vue'
  import { isSpeechSupported } from '../store/speech'
  import { loadResource } from '../utils/resourceLoader'
  import { fontFamily } from '../store/font'

  const route = useRoute()
  const router = useRouter()

  const navigateTo = path => {
    router.push(path)
  }
  const bookData = ref(null)
  const currentVolumeId = ref(null)
  const metadata = ref(null)
  const activeTab = ref(route.query.tab || '必背篇目')
  const tabs = ['必背篇目', '考级篇目']

  const writer = ref(null)
  const isPlaying = ref(true)
  const isFinished = ref(false)
  const showModal = ref(false)
  const currentChar = ref('')

  // 创建语音合成对象
  const synth = window.speechSynthesis

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

  // 播放汉字读音
  const playCharacterSound = char => {
    if (!isSpeechSupported.value) return
    // 创建语音合成话语对象
    const utterance = new SpeechSynthesisUtterance(char)
    // 获取选中的语音
    const selectedVoice = synth
      .getVoices()
      .find(voice => voice.name === voiceSettings.value.defaultVoice)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    utterance.rate = voiceSettings.value.speakRate || 0.1
    utterance.lang = 'zh-CN'
    // 播放语音
    synth.speak(utterance)
  }

  const onAnimationComplete = () => {
    isPlaying.value = false
    isFinished.value = true
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
      isFinished.value = false
      isPlaying.value = true
    }
  }

  const loadBookData = async () => {
    try {
      const data = await loadResource('books/jiujiu.json')
      metadata.value = data.metadata
      const [gid, vid] = route.params.id.split('')
      currentVolumeId.value = route.params.id
      const grade = data.grades.find(g => g.grade === parseInt(gid))
      if (grade) {
        // 重新组织数据结构
        const content = {
          必背篇目: [],
          考级篇目: []
        }
        const volume = grade.volumes.find(g => g.volume === parseInt(vid))
        if (volume) {
          // 处理必背篇目内容
          if (volume?.required) {
            content['必背篇目'] = volume.required.map(article => ({
              title: article.title,
              subtitle: article.subtitle || '',
              author: article.author || '',
              content: article.content || ''
            }))
          }

          // 处理考级篇目内容
          if (volume?.exam) {
            content['考级篇目'] = volume.exam.map(article => ({
              title: article.title,
              subtitle: article.subtitle || '',
              author: article.author || '',
              content: article.content || ''
            }))
          }
        }

        // 将处理后的数据赋值给 bookData
        bookData.value = {
          ...grade,
          content
        }
      }
    } catch (error) {
      console.error('Error loading book data:', error)
    }
  }


  onMounted(() => {
    loadBookData()
    loadSettings()
  })

  const closeModal = () => {
    showModal.value = false
  }

  const openBaiduHanyu = () => {
    window.open(
      `https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const switchTab = tab => {
    activeTab.value = tab
    router.push({
      query: { ...route.query, tab }
    })
  }
</script>

<template>
  <RightNav>
    <div class="p-4">
      <div>
        <router-link
          to="/book/jiujiu"
          class="text-2xl font-bold no-underline text-inherit dark:text-gray-300"
        >
          {{ metadata?.name }} {{ bookData?.volumes?.[0]?.term || '加载中...' }}
        </router-link>
      </div>
    </div>
  </RightNav>
  <div class="container px-4 py-8">
    <!-- 二级导航栏 -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-8">
      <div class="flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="[
            'px-4 py-2 text-base border-b-4 border-transparent transition-all duration-300 cursor-pointer',
            { 'text-primary-600 dark:text-primary-500 border-primary-600 dark:border-primary-400': activeTab === tab,
              'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 hover:border-primary-600 dark:hover:border-primary-300': activeTab !== tab
            }
          ]"
          @click="switchTab(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div
      v-if="bookData"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
      :style="{ fontFamily: fontFamily }"
    >
      <div
        v-for="(article, index) in bookData.content[activeTab]"
        :key="index"
        class="py-2"
      >
        <div
          @click="
            navigateTo(
              `/book/jiujiu/${currentVolumeId}/${activeTab === '必背篇目' ? 'required' : 'exam'}/${index + 1}`
            )
          "
          class="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-2"
        >
          <span class="text-primary-600 dark:text-primary-500 font-bold min-w-[2.5rem] text-right pr-2">{{ index + 1 }}.</span>
          <span class="text-gray-900 dark:text-gray-100 text-lg">{{ article.title }}</span>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" @click.self="closeModal">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-8 relative shadow-xl">
      <button @click="closeModal" class="absolute right-6 top-6 text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">
        &times;
      </button>
      <div id="character-target-modal" class="w-[300px] h-[300px] mx-auto mb-8"></div>
      <div class="flex justify-center gap-4">
        <button @click="togglePlay" class="p-3 bg-primary-500 hover:bg-primary-500-600 text-white rounded-md transition-all duration-300 transform hover:scale-105">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>
        <button @click="resetAnimation" class="p-3 bg-primary-500 hover:bg-primary-500-600 text-white rounded-md transition-all duration-300 transform hover:scale-105">
          <i class="fas fa-redo"></i>
        </button>
        <button @click="openBaiduHanyu" class="p-3 bg-primary-500 hover:bg-primary-500-600 text-white rounded-md transition-all duration-300 transform hover:scale-105">
          <i class="fas fa-search"></i>
        </button>
        <button
          @click="playCharacterSound(currentChar)"
          title="播放读音"
          class="p-3 bg-primary-500 hover:bg-primary-500-600 text-white rounded-md transition-all duration-300 transform hover:scale-105"
        >
          <i class="fas fa-volume-up"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* All styles have been moved to Tailwind classes in the template */
</style>
