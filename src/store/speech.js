import { ref } from 'vue'

// 创建全局状态
export const isSpeechSupported = ref(false)
export const voices = ref([])

// 检查浏览器是否支持语音合成
export function checkSpeechSupport() {
  // 检查 speechSynthesis API 是否存在
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.onvoiceschanged = () => {
        const allVoices = window.speechSynthesis.getVoices()
        const hasChineseVoice = allVoices.some(voice => {
          return (
            voice.lang.startsWith('zh-CN') || voice.lang.startsWith('zh-TW')
          )
        })
        if (hasChineseVoice) {
          isSpeechSupported.value = true
        } else {
          console.warn('没有可用的中文语音')
          isSpeechSupported.value = false
        }

        // 使用 Set 去重，确保相同名称的语音只会出现一次
        const uniqueVoices = new Map()
        allVoices
          .filter(
            voice => voice.lang.startsWith('zh') || voice.lang === 'zh-CN'
          )
          .forEach(voice => {
            if (!uniqueVoices.has(voice.name)) {
              uniqueVoices.set(voice.name, voice)
            }
          })
        voices.value = Array.from(uniqueVoices.values())
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
