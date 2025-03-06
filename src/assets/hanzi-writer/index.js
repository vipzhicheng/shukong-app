// 配置汉字笔顺数据加载器
import HanziWriter from 'hanzi-writer'

// 创建一个缓存对象来存储已加载的汉字数据
const characterDataCache = new Map()

// 自定义数据加载器
const customCharDataLoader = async (char, onComplete) => {
  try {
    // 如果缓存中已有数据，直接使用
    if (characterDataCache.has(char)) {
      onComplete(characterDataCache.get(char))
      return
    }

    // 尝试从本地加载数据
    try {
      const response = await fetch(`/hanzi-writer-data/${char}.json`)
      if (response.ok) {
        const data = await response.json()
        characterDataCache.set(char, data)
        onComplete(data)
        return
      }
    } catch (localError) {
      console.warn('从本地加载汉字数据失败，尝试从 CDN 加载:', localError)
    }

    // 如果本地加载失败，尝试从 CDN 加载
    HanziWriter.loadCharacterData(char).then(data => {
      characterDataCache.set(char, data)
      onComplete(data)
    })
  } catch (error) {
    console.error('加载汉字数据失败:', error)
    onComplete(null)
  }
}

// 导出配置函数
export const configureHanziWriter = () => {
  // 设置全局数据加载器
  HanziWriter.loadCharacterData = customCharDataLoader
}