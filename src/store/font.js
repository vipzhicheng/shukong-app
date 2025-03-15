import { ref } from 'vue'

export const fontSettings = ref({
  fontCDN: '',
  fontName: ''
})

// 从 localStorage 加载字体设置
export const loadFontSettings = () => {
  const savedFontSettings = localStorage.getItem('fontSettings')
  if (savedFontSettings) {
    fontSettings.value = Object.assign(fontSettings.value, JSON.parse(savedFontSettings))
    if (fontSettings.value.fontCDN) {
      const link = document.createElement('link')
      link.href = fontSettings.value.fontCDN
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }
}

// 保存字体设置到 localStorage
export const saveFontSettings = () => {
  localStorage.setItem('fontSettings', JSON.stringify(fontSettings.value))
}