<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-300 p-4">生字本</h1>

      </div>
    </div>
    <template v-slot:right>
      <button
        @click="toggleLayout"
        class="w-10 h-10 flex items-center justify-center border border-border dark:border-border-dark rounded hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300 cursor-pointer"
        :title="isGridLayout ? '切换到列表布局' : '切换到网格布局'"
      >
        <i :class="[isGridLayout ? 'fas fa-th' : 'fas fa-list', 'text-text dark:text-text-dark']"></i>
      </button>
      <button
        @click="showAddModal"
        class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors duration-300 mr-2"
      >
        手动添加
      </button>
      <button
        @click="clearWordbook"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
      >
        清空生字本
      </button>

      <!-- 添加生字 Modal -->
      <Teleport to="body">
        <div
          v-if="showAddWordsModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          @click.self="showAddWordsModal = false"
        >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
          <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-300">添加到生字本</h2>
          <textarea
            v-model="newWords"
            class="w-full h-40 p-3 border rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            placeholder="请输入要添加的字或词"
          ></textarea>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">一行一个字或词，一次可以添加多行</p>
          <div class="flex justify-end">
            <button
              @click="handleAddWords"
              class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors duration-300"
            >
              确定
            </button>
          </div>
        </div>
      </div>

      </Teleport>
    </template>
  </RightNav>
<div class="m-4">

    <div v-if="characters.length === 0" class="text-center text-text-secondary dark:text-text-secondary-dark py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
      生字本还是空的，快去添加一些生字吧！
    </div>

    <div v-else>
      <!-- 网格布局 -->
      <div
        v-if="isGridLayout"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
      >
        <template
          v-for="chars in characters"
          :key="chars"

        >

        <div
                v-for="char in chars.split('')"
                :key="char"
                class="aspect-square border border-border dark:border-border-dark rounded-lg flex items-center justify-center text-6xl text-text dark:text-text-dark bg-white dark:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                @click="showStrokeOrder(char)"
                :style="{ fontFamily }"
              >
                {{ char }}
              </div>
        </template>
      </div>
      <!-- 列表布局 -->
      <div v-else class="space-y-8">
        <div v-for="group in groupedCharacters" :key="group.date" class="space-y-4">
          <h2 class="text-xl font-semibold text-text dark:text-text-dark">{{ group.date }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            <template
              v-for="item in group.items"
              :key="item.word"
            >
              <div
                v-for="char in item.word.split('')"
                :key="char"
                class="aspect-square border border-border dark:border-border-dark rounded-lg flex items-center justify-center text-6xl text-text dark:text-text-dark bg-white dark:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                @click="showStrokeOrder(char)"
                :style="{ fontFamily }"
              >
                {{ char }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <StrokeOrderModal
      v-model:show="showModal"
      :character="selectedCharacter"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StrokeOrderModal from '../components/StrokeOrderModal.vue'
import RightNav from '../components/RightNav.vue'
import wordbook from '../store/wordbook'
import { message } from '../utils/message'
import { fontFamily } from '../store/font'

const isGridLayout = ref(true)
const toggleLayout = () => {
  isGridLayout.value = !isGridLayout.value
}

const characters = computed(() => wordbook.getCharacters())

const groupedCharacters = computed(() => {
  const groups = {}
  const wordbookData = wordbook.wordbook.value

  // 按日期分组
  wordbookData.forEach(item => {
    const date = new Date(item.timestamp)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(item)
  })

  // 转换为数组并排序
  return Object.entries(groups)
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => b.timestamp - a.timestamp)
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})
const showModal = ref(false)
const selectedCharacter = ref('')

const showStrokeOrder = (char) => {
  selectedCharacter.value = char
  showModal.value = true
}

const clearWordbook = () => {
  if (characters.value.length === 0) {
    message.warning('生字本已经是空的了')
    return
  }
  if (confirm('确定要清空生字本吗？此操作不可恢复。')) {
    wordbook.clearWordbook()
    message.success('生字本已清空')
  }
}

const showAddWordsModal = ref(false)
const newWords = ref('')

const showAddModal = () => {
  showAddWordsModal.value = true
  newWords.value = ''
}

const handleAddWords = () => {
  const words = newWords.value.split('\n')
  if (words.length === 0 || (words.length === 1 && !words[0].trim())) {
    message.warning('请输入要添加的字或词')
    return
  }
  wordbook.addWords(words)
  message.success('添加成功')
  showAddWordsModal.value = false
}
</script>