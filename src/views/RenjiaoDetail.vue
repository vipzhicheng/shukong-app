<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import RightNav from '../components/RightNav.vue'
  import { loadResource } from '../utils/resourceLoader'
  import StrokeOrderModal from '../components/StrokeOrderModal.vue'
  import { addToCart, countTotalCharacters } from '../store/cart'
  import { message } from '../utils/message'
  import { countChineseCharacters } from '../utils/common'

  const route = useRoute()
  const router = useRouter()
  const showModal = ref(false)
  const currentChar = ref('')

  // 字体设置
  const fontSettings = ref({
    fontName: '楷体',
    fontSize: 24,
    fontCDN: ''
  })

  // 加载字体设置
  onMounted(() => {
    const savedFontSettings = localStorage.getItem('fontSettings')
    if (savedFontSettings) {
      try {
        const settings = JSON.parse(savedFontSettings)
        fontSettings.value = {
          ...fontSettings.value,
          ...settings
        }
      } catch (e) {
        console.error('字体设置解析失败:', e)
      }
    }
  })

  const handleCharacterClick = char => {
    currentChar.value = char
    showModal.value = true
  }

  const bookData = ref(null)
  const metadata = ref(null)
  const activeTab = ref(route.query.tab || '识字表')
  const tabs = ['识字表', '写字表', '词语表']

  const switchTab = tab => {
    activeTab.value = tab
    router.push({
      query: { ...route.query, tab }
    })
  }

  const loadBookData = async () => {
    try {
      const data = await loadResource('books/renjiao.json')
      metadata.value = data.metadata
      const [gid, vid] = route.params.id.split('')
      const grade = data.grades.find(g => g.grade === parseInt(gid))
      if (grade) {
        const volume = grade.volumes.find(v => v.volume === parseInt(vid))
        // 重新组织数据结构
        const content = {
          识字表: [],
          写字表: [],
          词语表: []
        }

        // 处理识字内容
        if (volume?.recognition) {
          content['识字表'] = volume.recognition.map(lesson => ({
            title: volume.lessons?.[lesson.lesson] || lesson.lesson,
            number: lesson.short || '',
            characters: lesson.characters.map(char => ({
              character: char.character,
              pinyin: char.pinyin
            }))
          }))
        }
        if (volume.writing) {
          content['写字表'] = volume.writing.map(lesson => ({
            title: volume.lessons?.[lesson.lesson] || lesson.lesson,
            number: lesson.short || '',
            characters: lesson.characters.map(char => ({
              character: char.character,
              pinyin: char.pinyin
            }))
          }))
        }

        if (volume.words && volume.words.length > 0) {
          content['词语表'] = volume.words.map(lesson => ({
            title: volume.lessons?.[lesson.lesson] || lesson.lesson,
            number: lesson.short || '',
            characters: lesson.characters.map(chars => {
              return chars.map(char => ({
                character: char.character,
                pinyin: char.pinyin
              }))
            })
          }))
        }

        // 将处理后的数据赋值给 bookData
        bookData.value = {
          ...grade,
          volume,
          content
        }
      }
    } catch (error) {
      console.error('Error loading book data:', error)
    }
  }

  onMounted(() => {
    loadBookData()
  })

  const handlePencilClick = lesson => {
    // 将汉字添加到购物车
    let count = 0
    for (let item of lesson.characters) {
      if (countTotalCharacters() >= 1000) {
        message.error(
          `已添加 ${count} 字到书空笔顺练习，书空笔顺练习最多只能添加 1000 个字。`
        )
        return
      }
      if (Array.isArray(item)) {
        const word = item.map(subItem => subItem.character).join('')
        if (addToCart(word)) {
          count += countChineseCharacters(word)
        } else {
          continue
        }
      } else {
        if (addToCart(item.character)) {
          count += countChineseCharacters(item.character)
        } else {
          continue
        }
      }
    }

    // 显示添加成功的提示
    if (count > 0) {
      message.success(`已添加 ${count} 字到书空笔顺练习`)
    } else {
      message.error(`本次没有添加任何字，可能是之前已经添加过了。`)
    }
  }
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <router-link
          to="/book/renjiao"
          style="
            font-size: 1.5rem;
            font-weight: bold;
            text-decoration: none;
            color: inherit;
          "
        >
          {{ metadata?.name || '部编版语文' }}
          {{ (bookData && bookData.volume?.term) || '加载中...' }}
        </router-link>
      </div>
    </div>
  </RightNav>
  <div class="container px-4 py-8">
    <!-- 二级导航栏 -->
    <div class="tabs-container mb-8">
      <div class="tabs">
        <template v-for="tab in tabs" :key="tab">
          <button
            v-if="bookData && bookData.content?.[tab].length > 0"
            :class="['tab-button', { active: activeTab === tab }]"
            @click="switchTab(tab)"
          >
            {{ tab }}
          </button>
        </template>
      </div>
    </div>

    <!-- 内容区域 -->
    <div
      v-if="bookData"
      class="lessons-container"
      :style="
        fontSettings.fontName
          ? { fontFamily: fontSettings.fontName }
          : { fontFamily: 'KaiTi, 楷体, STKaiti, 华文楷体, serif' }
      "
    >
      <div
        v-for="(lesson, lessonIndex) in bookData.content?.[activeTab] || []"
        :key="lessonIndex"
        class="lesson-section"
      >
        <h3 class="lesson-title">
          <span v-if="lesson.number" class="lesson-number">{{
            lesson.number
          }}</span>
          {{ lesson.title }}
          <button
            @click="handlePencilClick(lesson)"
            class="quiz-button"
            title="开始书空练习"
          >
            <i class="fas fa-pencil-alt"></i>
          </button>
        </h3>
        <div class="characters-grid">
          <template v-if="activeTab === '词语表'">
            <div
              class="word-card flex flex-row gap-1"
              v-for="(chars, charIndex) in lesson.characters"
            >
              <div
                v-for="(item, charIndex) in chars"
                :key="charIndex"
                class="character-card"
                @click="handleCharacterClick(item.character)"
              >
                <div class="pinyin">{{ item.pinyin }}</div>
                <div class="character">{{ item.character }}</div>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, charIndex) in lesson.characters"
              :key="charIndex"
              class="character-card"
              @click="handleCharacterClick(item.character)"
            >
              <div class="pinyin">{{ item.pinyin }}</div>
              <div class="character">{{ item.character }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else class="loading-message">加载中...</div>

    <StrokeOrderModal v-model:show="showModal" :character="currentChar" />
  </div>
</template>

<style scoped>
  .container {
    margin-bottom: 1rem;
  }
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
    color: #4caf50;
    background-color: rgba(76, 175, 80, 0.05);
    border-bottom-color: rgba(76, 175, 80, 0.3);
  }

  .tab-button.active {
    color: #4caf50;
    border-bottom-color: #4caf50;
  }

  .lessons-container {
    font-family: inherit;
    font-size: inherit;
    line-height: 1.6;
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
  }

  .lesson-number {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 0.5rem;
    color: #4caf50;
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
</style>
