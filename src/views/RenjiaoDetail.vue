<script setup>
  import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
  const menuOpen = ref(false)
  const activeSection = ref('')
  const tocItems = ref([])


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

  // 切换目录菜单的显示状态
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
  }

  // 滚动到指定锚点
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      activeSection.value = sectionId
      // 在移动设备上点击后自动关闭菜单
      if (window.innerWidth < 768) {
        menuOpen.value = false
      }
    }
  }

  // 生成目录项
  const generateTOC = async () => {
    await nextTick()
    if (bookData.value && bookData.value.content && activeTab.value) {
      const lessons = bookData.value.content[activeTab.value] || []
      tocItems.value = lessons.map((lesson, index) => ({
        id: `lesson-${index}`,
        title: lesson.title,
        number: lesson.number || ''
      }))
    }
  }

  // 监听滚动事件，更新当前活动的章节
  const handleScroll = () => {
    if (tocItems.value.length === 0) return

    const sections = tocItems.value.map(item => document.getElementById(item.id))
    const validSections = sections.filter(section => section !== null)

    if (validSections.length === 0) return

    // 找到当前在视口中的章节
    for (let i = 0; i < validSections.length; i++) {
      const section = validSections[i]
      const rect = section.getBoundingClientRect()

      // 如果章节顶部在视口内或刚好在视口上方
      if (rect.top <= 100) {
        activeSection.value = section.id
        // 如果是最后一个章节且已经滚动到底部，则选中它
        if (i === validSections.length - 1 && rect.bottom <= window.innerHeight) {
          activeSection.value = section.id
          break
        }
      }
    }
  }

  // 监听标签页变化，重新生成目录
  watch(() => activeTab.value, () => {
    nextTick(() => {
      generateTOC()
    })
  })

  // 监听书籍数据变化，生成目录
  watch(() => bookData.value, () => {
    if (bookData.value) {
      nextTick(() => {
        generateTOC()
      })
    }
  })

  onMounted(() => {
    loadBookData()
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
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
  <div class="container px-4 py-8 mb-4 relative">
    <!-- 二级导航栏 -->
    <div class="border-b-2 border-gray-300 mb-8">
      <div class="flex gap-4">
        <template v-for="tab in tabs" :key="tab">
          <button
            v-if="bookData && bookData.content?.[tab].length > 0"
            :class="[
              'px-4 py-2 text-base border-0 bg-transparent cursor-pointer  border-b-3 border-transparent -mb-[3px] transition-all duration-300 rounded-none hover:text-green-500 hover:bg-green-50/5 hover:border-green-500/30',
              { 'text-green-500 border-green-500': activeTab === tab },
              { 'text-gray-800 dark:text-gray-300' : activeTab !== tab}
            ]"
            @click="switchTab(tab)"
          >
            {{ tab }}
          </button>
        </template>
      </div>
    </div>

    <!-- 目录导航 - 桌面版（左侧悬浮） -->
    <div
      v-if="bookData && tocItems.length > 0"
      class="hidden md:block fixed left-20 top-40 w-48 max-h-[70vh] overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 z-10"
    >
      <h3 class="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">目录</h3>
      <ul class="space-y-2">
        <li v-for="item in tocItems" :key="item.id" class="text-sm">
          <a
            href="javascript:void(0)"
            @click="scrollToSection(item.id)"
            :class="[
              'block py-1 px-2 rounded transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
              { 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium': activeSection === item.id }
            ]"
          >
            <span v-if="item.number" class="text-green-500 font-medium mr-1">{{ item.number }}</span>
            {{ item.title }}
          </a>
        </li>
      </ul>
    </div>

    <!-- 目录导航 - 移动版（可折叠） -->
    <div v-if="bookData && tocItems.length > 0" class="md:hidden mb-4">
      <button
        @click="toggleMenu"
        class="flex items-center justify-between w-full p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
      >
        <span class="font-medium">目录导航</span>
        <i :class="['fas', menuOpen ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
      <div
        v-show="menuOpen"
        class="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-h-[50vh] overflow-y-auto"
      >
        <ul class="space-y-2">
          <li v-for="item in tocItems" :key="item.id">
            <a
              href="javascript:void(0)"
              @click="scrollToSection(item.id)"
              :class="[
                'block py-2 px-3 rounded transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
                { 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium': activeSection === item.id }
              ]"
            >
              <span v-if="item.number" class="text-green-500 font-medium mr-1">{{ item.number }}</span>
              {{ item.title }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- 内容区域 -->
    <div
      v-if="bookData"
      class="flex flex-col gap-8 items-start min-h-[calc(100vh-200px)] text-gray-800 dark:text-gray-300 md:ml-52"
      :style="{ fontFamily: fontFamily }"
    >
      <div
        v-for="(lesson, lessonIndex) in bookData.content?.[activeTab] || []"
        :key="lessonIndex"
        :id="`lesson-${lessonIndex}`"
        class=" rounded-xl p-7 mb-4 shadow-sm border border-gray-300"
      >
        <h3 class="flex items-center gap-2 mb-4 text-xl font-bold ">
          <span v-if="lesson.number" class="text-xl font-bold text-green-500">{{ lesson.number }}</span>
          {{ lesson.title }}
          <button
            @click="handlePencilClick(lesson)"
            class="px-2 py-1 border-none bg-transparent cursor-pointer transition-colors duration-200 hover:text-primary-500"
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
                class="aspect-square w-[100px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 p-2"
                @click="handleCharacterClick(item.character)"
              >
                <div class="text-base mb-1">{{ item.pinyin }}</div>
                <div class="text-3xl">{{ item.character }}</div>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, charIndex) in lesson.characters"
              :key="charIndex"
              class="aspect-square w-[100px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 p-2"
              @click="handleCharacterClick(item.character)"
            >
              <div class="text-base mb-1">{{ item.pinyin }}</div>
              <div class="text-3xl">{{ item.character }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-600 text-lg p-8">加载中...</div>

    <StrokeOrderModal v-model:show="showModal" :character="currentChar" />
  </div>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
