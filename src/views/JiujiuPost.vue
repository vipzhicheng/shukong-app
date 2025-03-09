<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import RightNav from '../components/RightNav.vue'
import { isSpeechSupported } from '../store/speech'
import { createHanziWriter } from '../utils/hanziWriter'
import { loadResource } from '../utils/resourceLoader'

const route = useRoute()
const router = useRouter()
const postData = ref(null)
const bookData = ref(null)
const currentVolumeId = ref(null)
const metadata = ref(null)
const activeTab = ref('必背篇目')
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

const goBackPage = () => {
  // 从 URL 中获取文章类型
  const type = route.params.type
  // 根据文章类型构建返回链接
  const tab = type === 'exam' ? '考级篇目' : '必背篇目'
  router.push(`/book/jiujiu/${route.params.id}?tab=${encodeURIComponent(tab)}`)
}

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

const loadPostData = async () => {
  try {
    const data = await loadResource('books/jiujiu.json')
    metadata.value = data.metadata
    const [gid, vid] = route.params.id.split('')
    currentVolumeId.value = route.params.id
    const type = route.params.type
    let cid = route.params.cid
    cid = cid - 1 >= 0 ? cid : 1
    const grade = data.grades.find(g => g.grade === parseInt(gid))
    if (grade) {

      // 处理 postData
      const volume = grade.volumes.find(g => g.volume === parseInt(vid))
      if (volume && type && volume[type]) {
        const post = volume[type][cid - 1]?.content
        if (post) {
          postData.value = post
        }
      }

      // 处理 bookData
      const content = {
        '必背篇目': [],
        '考级篇目': []
      }
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

// 触摸事件相关变量
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 50 // 最小滑动距离

// 处理触摸开始事件
const handleTouchStart = (event) => {
  touchStartX.value = event.touches[0].clientX
}

// 处理触摸结束事件
const handleTouchEnd = (event) => {
  touchEndX.value = event.changedTouches[0].clientX
  const swipeDistance = touchEndX.value - touchStartX.value

  if (Math.abs(swipeDistance) >= minSwipeDistance) {
    if (swipeDistance > 0 && route.params.cid > 1) {
      // 向右滑动，显示上一篇
      router.push(`/book/jiujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) - 1}`)
    } else if (swipeDistance < 0 && bookData.value?.content[route.params.type === 'required' ? '必背篇目' : '考级篇目']?.length > parseInt(route.params.cid)) {
      // 向左滑动，显示下一篇
      router.push(`/book/iujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) + 1}`)
    }
  }
}

// 处理键盘事件
const handleKeyDown = (event) => {
  if (event.key === 'ArrowLeft' && route.params.cid > 1) {
    // 左箭头，显示上一篇
    router.push(`/book/jiujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) - 1}`)
  } else if (event.key === 'ArrowRight' && bookData.value?.content[route.params.type === 'required' ? '必背篇目' : '考级篇目']?.length > parseInt(route.params.cid)) {
    router.push(`/book/jiujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) + 1}`)
  }
}

onMounted(() => {
  loadPostData()
  loadSettings()
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyDown)
})

// 监听路由参数变化，重新加载文章数据
watch(() => route.params, () => {
  loadPostData()
}, { deep: true })

const closeModal = () => {
  showModal.value = false
}

const openBaiduHanyu = () => {
  window.open(`https://hanyu.baidu.com/hanyu-page/zici/s?wd=${encodeURIComponent(currentChar.value)}&ptype=zici`, '_blank', 'noopener,noreferrer')
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
  <div class="container px-4 py-8" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <!-- 导航区域 -->
    <div class="mb-4 nav-controller">
      <a href="#" @click.prevent="goBackPage" class="back-link">
        <i class="fas fa-arrow-left"></i>
        <span>返回目录</span>
      </a>

      <!-- 上一篇 -->
      <router-link
        :to="postData && route.params.cid > 1 ? `/book/jiujiu/${currentVolumeId}/${route.params.type}/${parseInt(route.params.cid) - 1}` : '#'"
        class="back-link ml-4"
        :class="{ 'disabled': !postData || route.params.cid <= 1 }"
        @click.prevent="postData && route.params.cid > 1 ? null : false"
      >
        <i class="fas fa-chevron-left"></i>
        <span>上一篇</span>
      </router-link>

      <!-- 下一篇 -->
      <router-link
        :to="postData && bookData?.content[route.params.type === 'required' ?'必背篇目' : '考级篇目']?.length > parseInt(route.params.cid) ? `/book/jiujiu/${currentVolumeId}/${route.params.type}/${parseInt(route.params.cid) + 1}` : '#'"
        class="back-link ml-4"
        :class="{ 'disabled': !postData || !bookData?.content[route.params.type === 'required' ?'必背篇目' : '考级篇目']?.length || bookData?.content[route.params.type === 'required' ?'必背篇目' : '考级篇目']?.length <= parseInt(route.params.cid) }"
        @click.prevent="postData && bookData?.content[route.params.type === 'required' ?'必背篇目' : '考级篇目']?.length > parseInt(route.params.cid) ? null : false"
      >
        <span>下一篇</span>
        <i class="fas fa-chevron-right"></i>
      </router-link>
    </div>


    <!-- 内容区域 -->
    <div v-if="postData" class="articles-container">
      <div
        class="article-section"
      >
        <div class="article-content">
          <template v-for="(section, sectionIndex) in postData" :key="sectionIndex">
            <!-- 标题渲染 -->
            <div v-if="section.type === 'title'" class="mb-6 text-center">
              <div v-for="(line, lineIndex) in section.lines" :key="lineIndex" class="flex flex-wrap justify-center">
                <div v-for="(token, tokenIndex) in line.tokens" :key="tokenIndex" class="character-container text-4xl font-bold cursor-pointer" @click="handleTokenClick(token)">
                  <div class="pinyin text-base">{{ token.pinyin || '　' }}</div>
                  <div class="character">{{ token.char }}</div>
                </div>
              </div>
            </div>
            <!-- 副标题渲染 -->
            <div v-else-if="section.type === 'subtitle'" class="mb-4 text-center">
              <div v-for="(line, lineIndex) in section.lines" :key="lineIndex" class="flex flex-wrap justify-center">
                <div v-for="(token, tokenIndex) in line.tokens" :key="tokenIndex" class="character-container text-3xl cursor-pointer" @click="handleTokenClick(token)">
                  <div class="pinyin text-base">{{ token.pinyin || '　' }}</div>
                  <div class="character">{{ token.char }}</div>
                </div>
              </div>
            </div>
            <!-- 段落渲染 -->
            <div v-else class="article-paragraph mb-4 text-justify flex flex-col items-center">
              <div v-for="(line, lineIndex) in section.lines" :key="lineIndex"
                   class="flex flex-wrap" :class="{'mb-6': section.break}">
                <div v-for="(token, tokenIndex) in line.tokens" :key="tokenIndex"
                     class="character-container cursor-pointer text-2xl ml-8" :class="{

                       'with-pinyin': token.pinyin && token.pinyin.trim() !== ''
                     }" @click="handleTokenClick(token)">
                  <div class="pinyin text-xs">{{ token.pinyin || '　' }}</div>
                  <div class="character">{{ token.char }}</div>
                </div>
              </div>
            </div>
          </template>
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
  margin: 0 2px;
  padding: 2px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .character-container {
    margin: 0 1px;
    padding: 1px;
  }
  .character-container.text-4xl {
    font-size: 1.75rem;
  }
  .character-container.text-3xl {
    font-size: 1.5rem;
  }
  .character-container.text-2xl {
    font-size: 1.25rem;
  }
  .character-container .pinyin {
    font-size: 0.75rem;
  }
  .article-paragraph {
    margin: 2rem 0;
  }
  .article-section {
    padding: 1rem;
  }
}
.character-container.with-pinyin {
  border: none;
  box-sizing: border-box;
  padding: 4px;
}

.article-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
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
.article-paragraph {
  margin: 4rem 0;
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
  gap: 2rem;
}


.article-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
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
.nav-controller {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-color);
  transition: color 0.3s;
}
.back-link:hover:not(.disabled) {
  color: var(--primary-color);
}
.back-link.disabled {
  color: var(--text-color-light);
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
