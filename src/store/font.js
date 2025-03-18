import { ref, computed, watch } from 'vue'
import cdnfonts from '../utils/cdnfonts'

export const fontLoaded = ref(false)
export const fontLoading = ref(false)
export const fontError = ref(false)

export const fontSettings = ref({
  fontCDN: '',
  fontName: ''
})

export const fontFamily = computed(() => {
  return (
    fontSettings.value.fontName ||
    selectedFont.value.fontName ||
    'KaiTi, 楷体, STKaiti, 华文楷体, serif'
  )
})

export const builtinFontSettings = ref({
  value: ''
})

export const selectedFont = computed(() => {
  return cdnfonts.find(font => font.value === builtinFontSettings.value.value)
})

export const loadFontCDN = () => {
  if (
    fontSettings.value.fontCDN ||
    (selectedFont.value && selectedFont.value.fontCDN)
  ) {
    // 重置状态
    fontLoaded.value = false
    fontLoading.value = true
    fontError.value = false

    const existingLink = document.getElementById('custom-font-link')
    if (existingLink) {
      document.head.removeChild(existingLink)
    }

    const link = document.createElement('link')
    link.id = 'custom-font-link'
    link.href =
      fontSettings.value.fontCDN ||
      (selectedFont.value && selectedFont.value.fontCDN)
    link.rel = 'stylesheet'
    // 监听加载事件
    link.onload = () => {
      fontLoading.value = false
      fontLoaded.value = true
      fontError.value = false
    }

    link.onerror = () => {
      fontLoading.value = false
      fontLoaded.value = false
      fontError.value = true
    }
    document.head.appendChild(link)
  }
}

// 监听字体设置变化
watch(
  [
    () => fontSettings.value.fontCDN,
    () => fontSettings.value.fontName,
    () => builtinFontSettings.value.value
  ],
  () => {
    loadFontCDN()
  },
  { immediate: true }
)

// 从 localStorage 加载字体设置
export const loadFontSettings = () => {
  const savedFontSettings = localStorage.getItem('fontSettings')
  if (savedFontSettings) {
    fontSettings.value = Object.assign(
      fontSettings.value,
      JSON.parse(savedFontSettings)
    )
  }

  const savedBuiltinFont = localStorage.getItem('builtinFontSettings')
  if (savedBuiltinFont) {
    builtinFontSettings.value = JSON.parse(savedBuiltinFont)
  }

  loadFontCDN()
}

// 保存字体设置到 localStorage
export const saveFontSettings = () => {
  localStorage.setItem('fontSettings', JSON.stringify(fontSettings.value))
  // if (fontSettings.value.fontCDN && fontSettings.value.fontName) {
  //   loadFontSettings()
  // }
}

// 保存内置字体设置到 localStorage
export const saveBuiltinFontSettings = () => {
  console.log('saveBuiltinFontSettings', builtinFontSettings.value)
  localStorage.setItem(
    'builtinFontSettings',
    JSON.stringify(builtinFontSettings.value)
  )
  // loadFontSettings()
}
