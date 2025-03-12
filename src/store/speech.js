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
      
      // 检查是否有可用的中文语音
      const voices = window.speechSynthesis.getVoices()
      const hasChineseVoice = voices.some(voice => 
        voice.lang.startsWith('zh-CN') || voice.lang.startsWith('zh-TW')
      )

      if (hasChineseVoice) {
        isSpeechSupported.value = true
      } else {
        console.warn('没有可用的中文语音')
        isSpeechSupported.value = false
      }
    } catch (error) {
      console.warn('语音合成不受支持:', error)
      isSpeechSupported.value = false
    }
  } else {
    console.warn('语音合成 API 不可用')
    isSpeechSupported.value = false
  }
}