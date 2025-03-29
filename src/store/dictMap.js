import { defineStore } from 'pinia'
import { openDB } from 'idb'

const DB_NAME = 'shukong-app'
const STORE_NAME = 'dict-map'
const DB_VERSION = 1

// 初始化 IndexDB
const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export const useDictMapStore = defineStore('dictMap', {
  state: () => ({
    // 内存缓存
    memoryCache: new Map()
  }),

  actions: {
    // 从内存缓存中获取数据
    getFromMemory(key) {
      // 过滤非中文字符
      const chineseOnlyKey = key.replace(/[^\u4e00-\u9fa5]/g, '')
      return this.memoryCache.get(chineseOnlyKey)
    },

    // 从 IndexDB 中获取数据
    async getFromIndexDB(key) {
      // 过滤非中文字符
      const chineseOnlyKey = key.replace(/[^\u4e00-\u9fa5]/g, '')
      const db = await initDB()
      try {
        const result = await db.get(STORE_NAME, chineseOnlyKey)
        if (result) {
          // 如果在 IndexDB 中找到数据，同时更新到内存缓存
          this.memoryCache.set(chineseOnlyKey, result)
        }
        return result
      } catch (error) {
        console.error('Error getting data from IndexDB:', error)
        return null
      } finally {
        db.close()
      }
    },

    // 保存数据到内存和 IndexDB
    async saveToCache(key, data) {
      // 保存到内存缓存
      this.memoryCache.set(key, data)

      // 保存到 IndexDB
      const db = await initDB()
      try {
        await db.put(STORE_NAME, data, key)
      } catch (error) {
        console.error('Error saving data to IndexDB:', error)
      } finally {
        db.close()
      }
    },

    // 清除缓存
    async clearCache() {
      // 清除内存缓存
      this.memoryCache.clear()

      // 清除 IndexDB 缓存
      const db = await initDB()
      try {
        await db.clear(STORE_NAME)
      } catch (error) {
        console.error('Error clearing IndexDB cache:', error)
      } finally {
        db.close()
      }
    }
  }
})
