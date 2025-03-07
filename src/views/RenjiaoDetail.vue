<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { isSpeechSupported } from '../store/speech'
import { createHanziWriter } from '../utils/hanziWriter'
import RightNav from '../components/RightNav.vue'
import { loadResource } from '../utils/resourceLoader'

const route = useRoute()
const router = useRouter()
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

onMounted(() => {
  loadSettings()
})
const onAnimationComplete = () => {
  isPlaying.value = false
  isFinished.value = true
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

    setTimeout(() => {
      isFinished.value = false
      isPlaying.value = true
    }, 300)
  }
}

const closeModal = () => {
  showModal.value = false
}

const openBaiduHanyu = () => {
  window.open(`https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`, '_blank', 'noopener,noreferrer')
}

const bookData = ref(null)
const metadata = ref(null)
const activeTab = ref('识字表')
const tabs = ['识字表', '写字表', '词语表']

const loadBookData = async () => {
  try {
    const data = await loadResource('books/renjiao.json')
    metadata.value = data.metadata
    const grade = data.grades.find(g => g.grade === parseInt(route.params.id))
    if (grade) {
      // 重新组织数据结构
      const content = {
        '识字表': [],
        '写字表': [],
        '词语表': []
      }

      // 处理识字内容
      if (grade.volumes?.[0]?.recognition) {
        content['识字表'] = grade.volumes[0].recognition.map(lesson => ({
          title: grade.volumes[0].lessons?.[lesson.lesson] || lesson.lesson,
          number: lesson.short || '',
          characters: lesson.characters.map(char => ({
            character: char.character,
            pinyin: char.pinyin
          }))
        }))
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

const navigateToCharacter = (char) => {
  router.push(`/zi/${encodeURIComponent(char)}`)
}

onMounted(() => {
  loadBookData()
})

const startQuiz = (lesson) => {
  // 将汉字按照每行一个的格式组织
  const characters = lesson.characters.map(item => item.character)
  const text = characters.join('\n')

  // 使用 base64 编码处理文本内容
  const encodedText = btoa(encodeURIComponent(text))
  const quizUrl = `/quiz/${encodedText}/?autostart=1`

  // 跳转到书空页面
  router.push(quizUrl)
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
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="bookData" class="lessons-container">
      <div
        v-for="(lesson, lessonIndex) in bookData.content?.[activeTab] || []"
        :key="lessonIndex"
        class="lesson-section"
      >
        <h3 class="lesson-title">
          <span v-if="lesson.number" class="lesson-number">{{ lesson.number }}</span>
          {{ lesson.title }}
          <button
            @click="startQuiz(lesson)"
            class="quiz-button"
            title="开始书空练习"
          >
            <i class="fas fa-pencil-alt"></i>
          </button>
        </h3>
        <div class="characters-grid">
          <div
            v-for="(item, charIndex) in lesson.characters"
            :key="charIndex"
            class="character-card"
            @click="handleCharacterClick(item.character)"
          >
            <div class="pinyin">{{ item.pinyin }}</div>
            <div class="character">{{ item.character }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading-message">
      加载中...
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
            v-if="isSpeechSupported"
            class="control-button"
            @click="playCharacterSound(currentChar)"
            title="播放读音"
          >
            <i class="fas fa-volume-up"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  border-bottom: 2px solid var(--border-color);
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

.tab-button:hover {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
  border-bottom-color: rgba(76, 175, 80, 0.3);
}

.tab-button.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.lessons-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: flex-start;
  min-height: calc(100vh - 200px);
}

.lesson-section {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.lesson-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: bold;
}

.quiz-button {
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  transition: color 0.2s;
}

.quiz-button:hover {
  color: var(--primary-color);
}

.lesson-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-family: "Kaiti SC", "楷体", KaiTi, STKaiti, "华文楷体", sans-serif;
}

.lesson-number {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 0.5rem;
  color: #4CAF50;
}

.characters-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.character-card {
  aspect-ratio: 1;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
}

.character-card .pinyin {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.character-card .character {
  font-size: 2rem;
  color: var(--text-color);
  font-family: "Kaiti SC", "楷体", KaiTi, STKaiti, "华文楷体", sans-serif;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  background-color: var(--bg-color-hover);
}

.loading-message {
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 1.2rem;
  padding: 2rem;
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
  background-color: var(--bg-color);
  padding: 20px;
  border-radius: 8px;
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  background: var(--bg-color-secondary);
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
  background-color: var(--bg-color);
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
  transition: background-color 0.2s;
}

.control-button:hover {
  background-color: #45a049;
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