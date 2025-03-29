import { defineStore } from 'pinia'
import { useQuizStore } from './quiz'

export const useWordsStore = defineStore('words', {
  state: () => ({
    allWords: new Set()
  }),
  actions: {
    async initializeWords() {
      const quizStore = useQuizStore()
      // 获取数据，如果为空则加载
      let quizData = quizStore.quizData
      if (!quizData || quizData.length === 0) {
        await quizStore.loadQuizData()
        quizData = quizStore.quizData
      }

      let quizHistory = quizStore.quizHistory
      if (!quizHistory || quizHistory.length === 0) {
        await quizStore.loadQuizHistory()
        quizHistory = quizStore.quizHistory
      }

      // 从 quiz.json 数据中收集汉字
      quizData.forEach(item => {
        if (Array.isArray(item.content)) {
          item.content.forEach(text => {
            Array.from(text.toString()).forEach(char => {
              if (/[\u4e00-\u9fa5]/.test(char)) {
                this.allWords.add(char)
              }
            })
          })
        }
      })

      // 从历史记录中收集汉字
      quizHistory.forEach(history => {
        if (Array.isArray(history.content)) {
          history.content.forEach(text => {
            Array.from(text.toString()).forEach(char => {
              if (/[\u4e00-\u9fa5]/.test(char)) {
                this.allWords.add(char)
              }
            })
          })
        }
      })
    },

    getRandomWords(count = 100) {
      if (this.allWords.size === 0) {
        this.initializeWords()
      }

      const wordsArray = Array.from(this.allWords)
      const totalWords = wordsArray.length
      const resultCount = Math.min(count, totalWords)

      // 使用 Fisher-Yates 洗牌算法随机选择字符
      const shuffled = [...wordsArray]
      for (let i = totalWords - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      return shuffled.slice(0, resultCount)
    }
  }
})
