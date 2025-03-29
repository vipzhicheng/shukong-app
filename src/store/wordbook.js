import { ref } from 'vue'

// 生字本最大容量
const MAX_WORDS = 1000

// 本地存储键名
const STORAGE_KEY = 'wordbook'

// 生字本数据
const wordbook = ref([])

// 从本地存储加载生字本数据
function loadWordbook() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      wordbook.value = JSON.parse(data)
    }
  } catch (error) {
    console.error('加载生字本失败:', error)
  }
}

// 保存生字本数据到本地存储
function saveWordbook() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wordbook.value))
  } catch (error) {
    console.error('保存生字本失败:', error)
  }
}

// 过滤出中文字符
function filterChineseCharacters(text) {
  return text.replace(/[^\u4e00-\u9fa5]/g, '')
}

// 添加生字
function addWord(word) {
  // 过滤出中文字符
  const filteredWord = filterChineseCharacters(word)
  if (!filteredWord) return

  // 移除已存在的相同汉字
  const index = wordbook.value.findIndex(item => item.word === filteredWord)
  if (index !== -1) {
    wordbook.value.splice(index, 1)
  }

  // 添加新的生字对象
  const newWord = {
    word: filteredWord,
    timestamp: Date.now()
  }
  wordbook.value.push(newWord)

  // 如果超过最大容量，删除最旧的生字
  if (wordbook.value.length > MAX_WORDS) {
    wordbook.value = wordbook.value.slice(0, MAX_WORDS)
  }

  // 保存到本地存储
  saveWordbook()
}

// 删除生字
function removeWord(word) {
  const index = wordbook.value.findIndex(item => item.word === word)
  if (index !== -1) {
    wordbook.value.splice(index, 1)
    saveWordbook()
  }
}

// 清空生字本
function clearWordbook() {
  wordbook.value = []
  saveWordbook()
}
// 初始化时加载数据
loadWordbook()

// 删除生字（如果存在）
function deleteWord(word) {
  const index = wordbook.value.findIndex(item => item.word === word)
  if (index !== -1) {
    wordbook.value.splice(index, 1)
    saveWordbook()
  }
}

// 检查字是否在生字本中
function isInWordbook(word) {
  return wordbook.value.some(item => item.word === word)
}

// 切换字在生字本中的状态
function toggle(word) {
  if (isInWordbook(word)) {
    deleteWord(word)
  } else {
    addWord(word)
  }
}

// 获取生字本中的所有字
function getCharacters() {
  return wordbook.value
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(item => item.word)
}

// 批量添加生字
function addWords(words) {
  words.forEach(word => {
    const trimmedWord = word.trim()
    if (trimmedWord) {
      addWord(trimmedWord)
    }
  })
}

export default {
  wordbook,
  addWord,
  addWords,
  removeWord,
  deleteWord,
  clearWordbook,
  isInWordbook,
  toggle,
  getCharacters
}
