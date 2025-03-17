import HanziWriter from 'hanzi-writer'
import { loadResource } from './resourceLoader'
/**
 * 创建汉字书写实例
 * @param {string} targetId - 目标DOM元素的ID
 * @param {string} char - 要显示的汉字
 * @param {Object} options - 配置选项
 * @param {number} options.width - 容器宽度
 * @param {number} options.height - 容器高度
 * @param {number} options.padding - 内边距
 * @param {boolean} options.showOutline - 是否显示轮廓
 * @param {number} options.strokeAnimationSpeed - 笔画动画速度
 * @param {number} options.delayBetweenStrokes - 笔画间延迟
 * @param {boolean} options.autoAnimate - 是否自动播放动画
 * @param {boolean} options.showCharacter - 是否显示汉字
 * @param {number} options.drawingWidth - 笔画宽度
 * @param {Function} options.onLoadCharDataSuccess - 字符数据加载成功回调
 * @param {Function} options.onComplete - 动画完成回调
 * @returns {HanziWriter} 返回HanziWriter实例
 */
export function createHanziWriter(targetId, char, options = {}) {
  const target = document.getElementById(targetId)
  if (!target) return null

  target.innerHTML = ''

  const defaultOptions = {
    width: 300,
    height: 300,
    padding: 5,
    showOutline: true,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 200,
    autoAnimate: false,
    showCharacter: false,
    drawingWidth: 3,
    charDataLoader: async function (char, onComplete) {
      // 判断是否为浏览器环境
      const isTauri = window.origin.startsWith('tauri://') || window.__TAURI__
      let isBrowser = !isTauri && !window.electron && !window.capacitor

      if (process.env.NODE_ENV === 'development') {
        // 开发环境下，使用本地数据，主要是学习机有第三方地址拦截，用于了CDN
        isBrowser = false
      }

      // CDN列表，按优先级排序
      const cdnList = [
        // 非浏览器环境或Tauri环境才使用本地数据
        ...(!isBrowser
          ? [
              // 本地数据
              async () => await loadResource(`hanzi-writer/data/${char}.json`)
            ]
          : []),
        // 官方CDN
        async () => await HanziWriter.loadCharacterData(char),
        // jsDelivr CDN
        async () => {
          const response = await fetch(
            `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`
          )
          if (!response.ok) throw new Error('jsDelivr加载失败')
          return await response.json()
        },
        // UNPKG CDN
        async () => {
          const response = await fetch(
            `https://unpkg.com/hanzi-writer-data@latest/${char}.json`
          )
          if (!response.ok) throw new Error('UNPKG加载失败')
          return await response.json()
        }
      ]

      // 依次尝试每个CDN
      for (const loadFn of cdnList) {
        try {
          const charData = await loadFn()
          if (charData) {
            onComplete(charData)
            return
          }
        } catch (error) {
          console.warn(`加载汉字数据失败，尝试下一个源: ${error.message}`)
          continue
        }
      }

      // 所有CDN都失败时的处理
      console.error('所有数据源都加载失败')
      onComplete(null)
    }
  }

  const writerOptions = { ...defaultOptions, ...options }
  return HanziWriter.create(targetId, char, writerOptions)
}
