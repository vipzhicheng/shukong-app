import { ref } from 'vue'
import { defineStore } from 'pinia'
import userStore from './user'

export const useStrokeGameStore = defineStore('strokeGame', () => {
  // 排行榜数据
  const leaderboard = ref([])

  // 从本地存储加载排行榜数据
  const loadLeaderboard = () => {
    const savedData = localStorage.getItem('strokeGame_leaderboard')
    if (savedData) {
      leaderboard.value = JSON.parse(savedData)
    }
  }

  // 保存排行榜数据到本地存储
  const saveLeaderboard = () => {
    localStorage.setItem(
      'strokeGame_leaderboard',
      JSON.stringify(leaderboard.value)
    )
  }

  // 添加新的成绩记录
  const addScore = score => {
    // 只有分数大于0时才添加到排行榜
    if (score > 0) {
      const newRecord = {
        score,
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        nickname: userStore.getNickname(),
        avatar: userStore.getAvatar()
      }

      // 添加新记录并按分数降序排序
      leaderboard.value = [...leaderboard.value, newRecord]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // 只保留前10名

      // 保存到本地存储
      saveLeaderboard()
    }
  }

  // 初始化时加载数据
  loadLeaderboard()

  return {
    leaderboard,
    addScore
  }
})
