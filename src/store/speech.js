import { ref } from 'vue'

// 创建全局状态
export const isSpeechSupported = ref(false)

// 检查浏览器是否支持语音合成
export function checkSpeechSupport() {
  // 检查 speechSynthesis API 是否存在
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      // 尝试创建一个语音合成实例
      const utterance = new SpeechSynthesisUtterance('test')
      // 如果没有抛出错误，说明支持语音合成
      isSpeechSupported.value = true
    } catch (error) {
      console.warn('语音合成不受支持:', error)
      isSpeechSupported.value = false
    }
  } else {
    console.warn('语音合成 API 不可用')
    isSpeechSupported.value = false
  }
}