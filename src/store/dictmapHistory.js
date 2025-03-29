import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export const useDictmapHistoryStore = defineStore('dictmapHistory', () => {
  const history = useStorage('dictmap-history', [], localStorage, {
    mergeDefaults: true
  })

  const addHistory = query => {
    // 过滤非中文字符
    const chineseOnlyQuery = query.replace(/[^\u4e00-\u9fa5]/g, '')
    if (!chineseOnlyQuery) return

    const existingIndex = history.value.findIndex(
      item => item.query === chineseOnlyQuery
    )
    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      // 更新现有记录的查询次数和时间
      history.value[existingIndex].count += 1
      history.value[existingIndex].lastQueried = now
    } else {
      // 添加新记录
      history.value.push({
        query: chineseOnlyQuery,
        lastQueried: now,
        count: 1
      })

      // 限制最大记录数为1000
      if (history.value.length > 1000) {
        // 按时间倒序排序后删除最旧的记录
        history.value.sort(
          (a, b) => new Date(b.lastQueried) - new Date(a.lastQueried)
        )
        history.value.splice(1000)
      }
    }
  }

  const clearHistory = () => {
    history.value = []
  }

  const getHistory = computed(() => {
    // 按最后查询时间倒序排序
    return [...history.value].sort(
      (a, b) => new Date(b.lastQueried) - new Date(a.lastQueried)
    )
  })

  return {
    history,
    addHistory,
    clearHistory,
    getHistory
  }
})
