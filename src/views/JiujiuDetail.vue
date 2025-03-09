<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import RightNav from '../components/RightNav.vue'
import { isSpeechSupported } from '../store/speech'
import { createHanziWriter } from '../utils/hanziWriter'
import { loadResource } from '../utils/resourceLoader'



const route = useRoute()
const router = useRouter()


const navigateTo = (path) => {
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
const playCharacterSound = (char) => {
  if (!isSpeechSupported.value) return
  // 创建语音合成话语对象
  const utterance = new SpeechSynthesisUtterance(char)
  // 获取选中的语音
  const selectedVoice = synth.getVoices().find(voice => voice.name === voiceSettings.value.defaultVoice)
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

const handleTokenClick = (token) => {
  if (token.pinyin) {
    handleCharacterClick(token.char)
  }
}

const handleCharacterClick = async (char) => {
  currentChar.value = char
  showModal.value = true
  // 根据自动播放设置决定是否播放语音
  if (voiceSettings.value.autoPlay) {
    playCharacterSound(char)
  }
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
        '必背篇目': [],
        '考级篇目': []
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
  window.open(`https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`, '_blank', 'noopener,noreferrer')
}

const switchTab = (tab) => {
  activeTab.value = tab
  router.push({
    query: { ...route.query, tab }
  })
}
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold;">{{ metadata?.name }} {{ bookData?.volumes?.[0]?.term || '加载中...' }}</a>
      </div>
    </div>
  </RightNav>
  <div class="container px-4 py-8">
    <!-- 二级导航栏 -->
    <div class="tabs-container mb-8">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-button', { active: activeTab === tab }]"
          @click="switchTab(tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="bookData" class="articles-container">
      <div v-for="(article, index) in bookData.content[activeTab]" :key="index" class="article-item">
        <div @click="navigateTo(`/book/jiujiu/${currentVolumeId}/${activeTab === '必背篇目' ? 'required' : 'exam'}/${index + 1}`)" class="article-link">
          <span class="article-index">{{ index + 1 }}.</span>
          <span class="article-title">{{ article.title }}</span>
        </div>
      </div>
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
        <button
          class="control-button"
          @click="playCharacterSound(currentChar)"
          title="播放读音"
        >
          <i class="fas fa-volume-up"></i>
        </button>
      </div>
    </div>
  </div>
</template>

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
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.close {
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.3s ease;
}

.close:hover {
  color: #333;
}

.character-display {
  width: 300px;
  height: 300px;
  margin: 0 auto 2rem;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.control-button:hover {
  background-color: #388E3C;
  transform: scale(1.05);
}

.character-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  padding: 4px;
  box-sizing: border-box;
}

.character-container.with-pinyin {
  border: none;
  box-sizing: border-box;
  padding: 4px;
}

.article-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: var(--text-color);
  font-family: "Kaiti SC", "楷体", KaiTi, STKaiti, "华文楷体", sans-serif;
}
.article-subtitle {
  font-size: 20px;
  margin-bottom: 0.5rem;
  text-align: center;
}

.article-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  padding: 2rem;
}

.container {
}

.tabs-container {
  border-bottom: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-color-secondary);
  border-bottom: 3px solid transparent;
  margin-bottom: -3px;
  transition: all 0.3s ease;
  border-radius: 0;
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.articles-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.article-item {
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.article-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.article-link:hover {
  background-color: var(--bg-color-hover);
  transform: translateX(8px);
}

.article-index {
  color: var(--primary-color);
  font-weight: bold;
  min-width: 2.5rem;
  text-align: right;
  padding-right: 0.5rem;
}


.article-subtitle {
  font-size: 1.25rem;
  color: var(--text-color-light);
  margin-bottom: 0.5rem;
}

.article-author {
  font-size: 1rem;
  color: var(--text-color-light);
  margin-bottom: 1rem;
  font-style: italic;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-color);
  white-space: pre-wrap;
  font-family: "Kaiti SC", "楷体", KaiTi, STKaiti, "华文楷体", sans-serif;
}
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
</style>