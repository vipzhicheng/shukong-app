<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <h1 class="text-xl font-bold text-gray-800 dark:text-gray-300 p-4 ">极限笔顺</h1>
      </div>
    </div>
  </RightNav>

  <div class="p-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg">
      <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 w-full sm:w-auto text-center sm:text-left">
        倒计时（秒）：{{ timeLeft.toFixed(2) }}
      </div>
      <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 w-full sm:w-auto text-center sm:text-left">
        完成字数：{{ completedCount }}
      </div>
    </div>

    <div class="flex flex-col lg:flex-row justify-between gap-8">
      <div v-if="!currentChar" class="w-full">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg text-center min-h-[500px] flex items-center justify-center">
          <button
            @click="startGame"
            class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-opacity-90 transition-colors duration-300 flex items-center justify-center gap-2 text-lg font-medium"
          >
            <i class="fas fa-play"></i>
            开始游戏
          </button>
        </div>
      </div>
      <div v-else class="w-full">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div id="character-target" class="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] mx-auto"></div>
        </div>
      </div>

      <!-- 排行榜区块 -->
      <div class="w-full lg:max-w-md bg-white dark:bg-gray-800 p-4 rounded-lg">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-300 mb-4 ">排行榜</h2>
        <div class="space-y-4">
          <div v-for="item in rankedLeaderboard" :key="item.timestamp" class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-xl font-bold text-gray-800 dark:text-gray-200 w-8">
              {{ item.rank }}
            </div>
            <img :src="item.avatar" alt="avatar" class="w-10 h-10 rounded-full">
            <div class="flex-1">
              <div class="text-gray-800 dark:text-gray-200 font-medium">{{ item.nickname }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.date }}</div>
            </div>
            <div class="text-lg font-bold text-primary-500">
              {{ item.score }} 字
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useWordsStore } from '../store/words'
import { message } from '../utils/message'
import { createHanziWriter } from '../utils/hanziWriter'
import '@fortawesome/fontawesome-free/css/all.css'
import { useQuizStore } from '../store/quiz'
import { useStrokeGameStore } from '../store/strokeGame'
import RightNav from '../components/RightNav.vue'

const quizStore = useQuizStore()
const quizSettings = computed(() => quizStore.quizSettings)
const wordsStore = useWordsStore()
const strokeGameStore = useStrokeGameStore()

// 计算排行榜名次
const rankedLeaderboard = computed(() => {
  const leaderboard = strokeGameStore.leaderboard
  let currentRank = 1
  let lastScore = null

  return leaderboard.map((item, index) => {
    if (lastScore !== null && item.score !== lastScore) {
      currentRank = index + 1
    }
    lastScore = item.score
    return { ...item, rank: currentRank }
  })
})
const timeLeft = ref(60.00)
const completedCount = ref(0)
const currentIndex = ref(0)
const currentChar = ref('')

let timer = null
let characters = []
let writer = null

// 初始化游戏
const initGame = async () => {
  // 清理现有的 writer 实例
  if (writer) {
    writer.quiz = null
    writer = null
  }
  // 重置状态
  timeLeft.value = 60
  completedCount.value = 0
  currentIndex.value = 0
  currentChar.value = ''

  // 获取随机汉字
  characters = await wordsStore.getRandomWords(100)
}

// 开始游戏
const startGame = async () => {
  await initGame()
  currentChar.value = characters[0]
  // 初始化笔顺渲染
  nextTick(() => initWriter())
  // 开始倒计时
  startTimer()
}

// 开始倒计时
const startTimer = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value = Math.max(0, timeLeft.value - 0.01)
    } else {
      endGame()
    }
  }, 10)
}

// 结束游戏
const endGame = () => {
  clearInterval(timer)
  timer = null
  currentChar.value = ''
  // 添加成绩到排行榜
  strokeGameStore.addScore(completedCount.value)
  if (completedCount.value === 0) {
    message.info(`您在60秒内完成了 ${completedCount.value} 个汉字的笔顺练习，很遗憾没能上榜！`).then(handleRestart)
    return
  } else {
    message.success(`恭喜您在60秒内完成了 ${completedCount.value} 个汉字的笔顺练习！`).then(handleRestart)

  }
}

// 初始化笔顺渲染
const initWriter = () => {
  if (writer) {
    writer.quiz()
    return
  }

  writer = createHanziWriter('character-target', currentChar.value, {
    width: 300,
    height: 300,
    showOutline: true,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 200,
    showCharacter: false,
    drawingWidth: quizSettings.value.drawingWidth,
    onLoadCharDataSuccess: (charData) => {
      if (!charData) {
        console.error('笔顺数据加载失败')
        currentIndex.value++
        const nextIndex = currentIndex.value
        if (nextIndex < characters.length && timeLeft.value > 0) {
          currentChar.value = characters[nextIndex]
          writer = null
          nextTick(() => initWriter())
        } else {
          endGame()
        }
        return
      }
      writer.quiz()
    },
    onComplete: () => {
      completedCount.value++
      currentIndex.value++
      const nextIndex = currentIndex.value
      if (nextIndex < characters.length && timeLeft.value > 0) {
        currentChar.value = characters[nextIndex]
        writer = null
        nextTick(() => initWriter())
      } else {
        endGame()
      }
    }
  })
}


// 重新开始游戏
const handleRestart = () => {
  // 清理计时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  initGame()
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
