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
  import {  fontFamily } from '../store/font'

  const route = useRoute()
  const router = useRouter()
  const showModal = ref(false)
  const currentChar = ref('')


  const handleCharacterClick = char => {
    currentChar.value = char
    showModal.value = true
  }

  const bookData = ref(null)
  const metadata = ref(null)
  const activeTab = ref(route.query.tab)
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
          if (!activeTab.value && content['识字表'].length > 0) {
            activeTab.value = '识字表'
          }
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
          if (!activeTab.value && content['写字表'].length > 0) {
            activeTab.value = '写字表'
          }
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
          if (!activeTab.value && content['词语表'].length > 0) {
            activeTab.value = '词语表'
          }
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
          class="text-2xl font-bold no-underline text-inherit"
        >
          {{ metadata?.name || '部编版语文' }}
          {{ (bookData && bookData.volume?.term) || '加载中...' }}
        </router-link>
      </div>
    </div>
  </RightNav>
  <div class="container px-4 py-8 mb-4">
    <!-- 二级导航栏 -->
    <div class="border-b-2 border-[var(--border-color)] mb-8">
      <div class="flex gap-4">
        <template v-for="tab in tabs" :key="tab">
          <button
            v-if="bookData && bookData.content?.[tab].length > 0"
            :class="[
              'px-4 py-2 text-base border-0 bg-transparent cursor-pointer text-[var(--text-color-secondary)] border-b-3 border-transparent -mb-[3px] transition-all duration-300 rounded-none hover:text-green-500 hover:bg-green-50/5 hover:border-green-500/30',
              { 'text-green-500 border-green-500': activeTab === tab }
            ]"
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
      class="flex flex-col gap-8 items-start min-h-[calc(100vh-200px)]"
      :style="{ fontFamily: fontFamily }"
    >
      <div
        v-for="(lesson, lessonIndex) in bookData.content?.[activeTab] || []"
        :key="lessonIndex"
        class="bg-[var(--bg-color-secondary)] rounded-xl p-7 mb-4 shadow-sm border border-[var(--border-color)]"
      >
        <h3 class="dark:text-gray-300 flex items-center gap-2 mb-4 text-xl font-bold text-[var(--text-color)]">
          <span v-if="lesson.number" class=" text-xl font-bold text-green-500">{{ lesson.number }}</span>
          {{ lesson.title }}
          <button
            @click="handlePencilClick(lesson)"
            class="px-2 py-1 border-none bg-transparent text-[var(--text-color)] cursor-pointer transition-colors duration-200 hover:text-[var(--primary-color)]"
            title="开始书空练习"
          >
            <i class="fas fa-pencil-alt"></i>
          </button>
        </h3>
        <div class="flex flex-wrap gap-5">
          <template v-if="activeTab === '词语表'">
            <div
              class="word-card flex flex-row gap-1"
              v-for="(chars, charIndex) in lesson.characters"
            >
              <div
                v-for="(item, charIndex) in chars"
                :key="charIndex"
                class="dark:bg-gray-800 aspect-square w-[100px] flex flex-col items-center justify-center bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[var(--bg-color-hover)] p-2"
                @click="handleCharacterClick(item.character)"
              >
                <div class="text-base dark:text-gray-300 text-[var(--text-color-secondary)] mb-1">{{ item.pinyin }}</div>
                <div class="text-3xl dark:text-gray-300 text-[var(--text-color)]">{{ item.character }}</div>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, charIndex) in lesson.characters"
              :key="charIndex"
              class="dark:bg-gray-800  aspect-square w-[100px] flex flex-col items-center justify-center bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[var(--bg-color-hover)] p-2"
              @click="handleCharacterClick(item.character)"
            >
              <div class="text-base dark:text-gray-300 text-[var(--text-color-secondary)] mb-1">{{ item.pinyin }}</div>
              <div class="text-3xl dark:text-gray-300 text-[var(--text-color)]">{{ item.character }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-[var(--text-color-secondary)] text-lg p-8">加载中...</div>

    <StrokeOrderModal v-model:show="showModal" :character="currentChar" />
  </div>
</template>

<style scoped>
</style>
