import { ref, computed } from 'vue'

// 查询历史记录存储模块
const history = ref([])

// 从 localStorage 加载历史记录
const loadHistory = () => {
  const savedHistory = localStorage.getItem('queryHistory')
  history.value = savedHistory ? JSON.parse(savedHistory) : []
}

// 初始加载历史记录
loadHistory()

// 保存历史记录到 localStorage
const saveHistory = () => {
  localStorage.setItem('queryHistory', JSON.stringify(history.value))
}

// 过滤汉字
const filterHanzi = text => {
  return Array.from(text)
    .filter(char => /[\u4e00-\u9fa5]/.test(char))
    .join('')
}

// 清理过期记录
const cleanHistory = () => {
  if (history.value.length <= 1000) return

  // 按查询时间排序，保留最新的1000条
  history.value = history.value
    .sort((a, b) => b.queryTime - a.queryTime)
    .slice(0, 1000)
}

// 添加或更新查询记录
const addQueryHistory = query => {
  const hanzi = filterHanzi(query)
  if (!hanzi) return

  const now = Date.now()

  // 查找是否存在相同查询
  const existingIndex = history.value.findIndex(item => item.query === hanzi)

  if (existingIndex > -1) {
    // 更新已存在的记录，使用展开运算符创建新对象以确保响应式更新
    const updatedItem = {
      ...history.value[existingIndex],
      queryCount: history.value[existingIndex].queryCount + 1,
      queryTime: now
    }
    history.value.splice(existingIndex, 1, updatedItem)
  } else {
    // 添加新记录
    history.value.push({
      query: hanzi,
      queryTime: now,
      queryCount: 1
    })
  }

  // 清理过期记录
  cleanHistory()

  // 保存更新后的历史记录
  saveHistory()
}

// 获取查询历史
const getQueryHistory = () => history.value

// 最新查询记录的计算属性
const latestQueries = computed(() => {
  return [...history.value]
    .sort((a, b) => b.queryTime - a.queryTime)
    .slice(0, 10)
})

// 最频繁查询记录的计算属性
const frequentQueries = computed(() => {
  return [...history.value]
    .sort((a, b) => b.queryCount - a.queryCount)
    .slice(0, 10)
})

// 清空查询历史
const clearQueryHistory = () => {
  history.value = []
  localStorage.removeItem('queryHistory')
}

export {
  addQueryHistory,
  getQueryHistory,
  clearQueryHistory,
  latestQueries,
  frequentQueries
}
