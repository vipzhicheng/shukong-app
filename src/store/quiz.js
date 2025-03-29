import { defineStore } from 'pinia'
import { md5 } from '../utils/common'
import { loadResource } from '../utils/resourceLoader'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    inputText: '',
    currentChar: '',
    isPlaying: false,
    isFinished: false,
    showQuiz: false,
    errorCount: 0,
    errorChars: new Map(),
    progress: { current: 0, total: 0 },
    allChars: [],
    currentCharIndex: 0,
    quizData: [],
    quizHistory: [],
    quizSettings: {
      containerSize: 500,
      maxLines: 40,
      maxCharsPerLine: 10,
      drawingWidth: 50
    },
    activeTab: '自由'
  }),
  actions: {
    setActiveTab(tab) {
      this.activeTab = tab
    },
    resetState() {
      this.inputText = ''
      this.currentChar = ''
      this.isPlaying = false
      this.isFinished = false
      this.showQuiz = false
      this.progress = { current: 0, total: 0 }
      this.allChars = []
      this.currentCharIndex = 0
      this.errorCount = 0
      this.errorChars.clear()
    },
    loadQuizSettings() {
      const savedSettings = localStorage.getItem('quizSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        this.quizSettings = { ...this.quizSettings, ...settings }
      }
    },
    saveQuizSettings() {
      localStorage.setItem('quizSettings', JSON.stringify(this.quizSettings))
    },
    loadQuizHistory() {
      const savedHistory = localStorage.getItem('quizHistory')
      if (savedHistory) {
        this.quizHistory = JSON.parse(savedHistory)
      }
    },
    clearHistory() {
      this.quizHistory = []
      localStorage.removeItem('quizHistory')
    },
    saveQuizHistory(content, errors = 0, forceAddNewHistory = false) {
      const currentHistory = this.quizHistory || []
      const contentHash = md5(content.join(''))
      const newHistoryItem = {
        uuid: contentHash,
        startTime: new Date().toISOString(),
        content: content,
        totalChars: content.reduce((acc, line) => acc + line.length, 0),
        errorCount: errors
      }

      if (
        currentHistory.length > 0 &&
        currentHistory[0].uuid === contentHash &&
        !forceAddNewHistory
      ) {
        currentHistory[0].errorCount = errors
      } else {
        currentHistory.unshift(newHistoryItem)
      }

      this.quizHistory = currentHistory.slice(0, 10)
      localStorage.setItem('quizHistory', JSON.stringify(this.quizHistory))
    },
    handleStrokeError(char) {
      this.errorCount++
      const currentCount = this.errorChars.get(char) || 0
      this.errorChars.set(char, currentCount + 1)
    },
    setCurrentCharIndex(index) {
      this.currentCharIndex = index
    },
    setProgress(current, total = null) {
      if (total !== null) {
        this.progress.total = total
      }
      this.progress.current = current
    },
    setQuizContent(content) {
      const filteredContent = content
        .map(line =>
          Array.from(line.toString())
            .filter(char => /[\u4e00-\u9fa5]/.test(char))
            .slice(0, this.quizSettings.maxCharsPerLine)
            .join('')
        )
        .filter(line => line.length > 0)
        .slice(0, this.quizSettings.maxLines)

      this.progress.total = filteredContent.length
      this.progress.current = 0
      this.allChars = filteredContent.map(word => Array.from(word))

      if (this.allChars.length > 0 && this.allChars[0].length > 0) {
        this.currentCharIndex = 0
        this.showQuiz = true
        return true
      }
      return false
    },
    setCurrentChar(char) {
      this.currentChar = char
    },
    setIsPlaying(value) {
      this.isPlaying = value
    },
    setShowQuiz(value) {
      this.showQuiz = value
    },
    setIsFinished(value) {
      this.isFinished = value
    },
    setAllChars(chars) {
      this.allChars = chars
    },
    setErrorCount(count) {
      this.errorCount = count
    },
    async loadQuizData() {
      try {
        const data = await loadResource('quiz.json')
        this.quizData = data.data
      } catch (error) {
        console.error('加载作业数据失败:', error)
      }
    }
  }
})
