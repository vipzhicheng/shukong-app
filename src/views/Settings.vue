<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { isSpeechSupported, voices } from '../store/speech'
  import { useThemeStore } from '../store/theme'
  import RightNav from '../components/RightNav.vue'
  import Switch from '../components/Switch.vue'
  import cdnfonts from '../utils/cdnfonts'
  import { aiVendors, aiTypes } from '../utils/aivendors'
  import { testVendorAPI } from '../utils/aitest'
  import { fontFamily, builtinFontSettings, saveBuiltinFontSettings, fontSettings, saveFontSettings, fontError, fontLoaded, fontLoading } from '../store/font'
    import { message } from '../utils/message'


  const themeStore = useThemeStore()
  const themeSettings = ref({
    mode: themeStore.mode
  })

  const saveThemeSettings = () => {
    themeStore.mode = themeSettings.value.mode
    localStorage.setItem('themeMode', themeSettings.value.mode)
    themeStore.applyTheme()
  }

  const voiceSettings = ref({
    defaultVoice: '',
    speakRate: 1,
    autoPlay: false
  })

  const quizSettings = ref({
    containerSize: 500,
    maxLines: 40,
    maxCharsPerLine: 10,
    drawingWidth: 50
  })

  const autoPlaySettings = ref({
    autoPlay: false
  })

  const aiSettings = ref({
    aiEnabled: false,
    selectedVendor: '',
    vendorConfigs: {}
  })

  const testText = ref('你好，欢迎使用书空')

  const loadSettings = () => {
    const savedAutoPlaySettings = localStorage.getItem('autoPlaySettings')
    if (savedAutoPlaySettings) {
      autoPlaySettings.value = Object.assign(
        autoPlaySettings.value,
        JSON.parse(savedAutoPlaySettings)
      )
    }
    const savedAiSettings = localStorage.getItem('aiSettings')
    if (savedAiSettings) {
      aiSettings.value = Object.assign(
        aiSettings.value,
        JSON.parse(savedAiSettings)
      )
    }
    // 初始化供应商配置
    aiVendors.forEach(vendor => {
      if (!aiSettings.value.vendorConfigs[vendor.id]) {
        aiSettings.value.vendorConfigs[vendor.id] = {
          apiBaseUrl: vendor.config.apiBaseUrl,
          apiKey: vendor.config.apiKey
        }
      }
    })
    // 如果没有选中的供应商，默认选择第一个
    if (!aiSettings.value.selectedVendor && aiVendors.length > 0) {
      aiSettings.value.selectedVendor = aiVendors[0].id
    }
    const savedVoiceSettings = localStorage.getItem('voiceSettings')
    if (savedVoiceSettings) {
      voiceSettings.value = Object.assign(
        voiceSettings.value,
        JSON.parse(savedVoiceSettings)
      )
    }

    const savedQuizSettings = localStorage.getItem('quizSettings')
    if (savedQuizSettings) {
      quizSettings.value = Object.assign(
        quizSettings.value,
        JSON.parse(savedQuizSettings)
      )
    }
  }

  const saveVoiceSettings = () => {
    localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings.value))
  }

  const saveQuizSettings = () => {
    localStorage.setItem('quizSettings', JSON.stringify(quizSettings.value))
  }

  const saveAiSettings = () => {
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings.value))
  }

  const selectedVendor = computed(() => {
    return aiVendors.find(vendor => vendor.id === aiSettings.value.selectedVendor)
  })

  const selectedVendorConfig = computed(() => {
    if (!aiSettings.value.selectedVendor) return null
    return aiSettings.value.vendorConfigs[aiSettings.value.selectedVendor]
  })


  const playTestText = () => {
    if (!isSpeechSupported.value || !testText.value) return
    const synth = window.speechSynthesis
    // 取消当前正在播放的语音
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(testText.value)
    const selectedVoice = synth
      .getVoices()
      .find(voice => voice.name === voiceSettings.value.defaultVoice)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    utterance.lang = 'zh-CN'
    utterance.rate = voiceSettings.value.speakRate || 0.1
    synth.speak(utterance)
  }

  const scrollToSection = sectionId => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 20 // 顶部导航栏的高度
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }




  onMounted(() => {
    loadSettings()
  })
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold">设置</a>
      </div>
    </div>
  </RightNav>
  <div class="max-w-[800px] mx-auto px-5 py-5 mt-[60px]">
    <ul class="hidden xl:block rounded-md font-bold xl:fixed md:left-[100px] md:top-[150px] md:bg-transparent md:p-4 md:gap-3 md:border md:border-gray-300">
      <li @click="scrollToSection('general-settings')" class="dark:text-gray-400 text-gray-800 no-underline px-4 py-2 cursor-pointer transition-colors duration-300 hover:text-primary-500">基本设置</li>
      <li @click="scrollToSection('font-settings')" class="dark:text-gray-400 text-gray-800 no-underline px-4 py-2 cursor-pointer transition-colors duration-300 hover:text-primary-500">字体设置</li>
      <li v-if="isSpeechSupported" @click="scrollToSection('voice-settings')" class="dark:text-gray-400 text-gray-800 no-underline px-4 py-2 cursor-pointer transition-colors duration-300 hover:text-primary-500">朗读设置</li>
      <li @click="scrollToSection('quiz-settings')" class="dark:text-gray-400 text-gray-800 no-underline px-4 py-2 cursor-pointer transition-colors duration-300 hover:text-primary-500">书空设置</li>
      <li @click="scrollToSection('ai-settings')" class="dark:text-gray-400 text-gray-800 no-underline px-4 py-2 cursor-pointer transition-colors duration-300 hover:text-primary-500">AI 设置</li>
    </ul>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-300" id="general-settings">
      <h2 class="text-xl font-medium dark:text-gray-400 text-gray-800 mb-5 pb-3 border-b border-gray-300">基本设置</h2>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600 dark:text-gray-300">主题：</label>
          <div class="flex gap-5">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="themeSettings.mode"
                value="light"
                @change="saveThemeSettings"
                class="cursor-pointer"
              />
              <span class="dark:text-gray-300 text-gray-800">亮色</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="themeSettings.mode"
                value="dark"
                @change="saveThemeSettings"
                class="cursor-pointer"
              />
              <span class="dark:text-gray-300 text-gray-800">暗色</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="themeSettings.mode"
                value="system"
                @change="saveThemeSettings"
                class="cursor-pointer"
              />
              <span class="dark:text-gray-300 text-gray-800">跟随系统</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-300" id="ai-settings">
      <h2 class="text-xl font-medium dark:text-gray-400 text-gray-800 mb-5 pb-3 border-b border-gray-300">AI 设置</h2>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <label class="text-base text-gray-600 dark:text-gray-300">启用 AI 功能</label>
            <Switch disabled="true" v-model="aiSettings.aiEnabled" @change="saveAiSettings" />
          </div>
        </div>

        <div v-if="aiSettings.aiEnabled" class="flex flex-col gap-6">
          <div class="flex gap-6">
            <!-- 左侧供应商列表 -->
            <div class="w-1/3">
              <div class="flex flex-col gap-3">
                <label class="text-base text-gray-600 dark:text-gray-300">AI 供应商</label>
                <div class="flex flex-col gap-2">
                  <button
                    v-for="vendor in aiVendors"
                    :key="vendor.id"
                    @click="aiSettings.selectedVendor = vendor.id"
                    :class="[
                      'w-full px-4 py-3 text-left rounded-lg transition-colors duration-200',
                      aiSettings.selectedVendor === vendor.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900'
                    ]"
                  >
                    {{ vendor.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 右侧配置项 -->
            <div class="flex-1" v-if="aiSettings.selectedVendor">
              <div class="flex flex-col gap-4">
                <div v-if="selectedVendorConfig" class="flex flex-col gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-base text-gray-600 dark:text-gray-300">API 基础 URL</label>
                    <input
                      type="text"
                      v-model="selectedVendorConfig.apiBaseUrl"
                      @change="saveAiSettings"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:bg-gray-700 dark:text-gray-300 text-gray-800 bg-gray-100 transition-colors duration-300 hover:border-green-500"
                    />
                    <button
                      @click="async () => {
                        const result = await testVendorAPI(
                          selectedVendor.id,
                          selectedVendorConfig.apiBaseUrl,
                          selectedVendorConfig.apiKey
                        )
                        message.success(result.message)
                      }"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-500 transition-colors duration-200"
                      title="测试连通性"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-base text-gray-600 dark:text-gray-300">API 密钥</label>
                    <input
                      type="password"
                      v-model="selectedVendorConfig.apiKey"
                      @change="saveAiSettings"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:bg-gray-700 dark:text-gray-300 text-gray-800 bg-gray-100 transition-colors duration-300 hover:border-green-500"
                    />
                    <button
                      @click="async () => {
                        const result = await testVendorAPI(
                          selectedVendor.id,
                          selectedVendorConfig.apiBaseUrl,
                          selectedVendorConfig.apiKey
                        )
                        message.alert(result.message)
                      }"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-500 transition-colors duration-200"
                      title="测试连通性"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </button>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-300" id="font-settings">
      <h2 class="text-xl font-medium dark:text-gray-400 text-gray-800 mb-5 pb-3 border-b border-gray-300">字体设置</h2>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600 dark:text-gray-300 ">推荐尝试字体：</label>
          <select
            v-model="builtinFontSettings.value"
            @change="saveBuiltinFontSettings"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:bg-gray-700 dark:text-gray-300 text-gray-800 bg-gray-100 cursor-pointer transition-colors duration-300 hover:border-green-500"
          >
            <option
              v-for="font in cdnfonts"
              :key="font.value"
              :value="font.value"
            >
              {{ font.label }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600">字体CDN链接：</label>
          <input
            type="text"
            v-model="fontSettings.fontCDN"
            @change="saveFontSettings"
            placeholder="请输入字体CDN链接，例如：https://fonts.googleapis.com/css2?family=Noto+Serif+SC&display=swap"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:bg-gray-700 dark:text-gray-300 text-gray-800 bg-gray-100 transition-colors duration-300 hover:border-green-500"
          />
          <p class="text-sm text-gray-600">
            输入包含字体的CSS链接，通常是字体服务商提供的CDN链接，例如<a
              href="https://chinese-font.netlify.app/"
              target="_blank"
              class="text-green-500 hover:text-green-600"
            >这个</a
            >和<a href="https://fonts.zeoseven.com/" target="_blank" class="text-green-500 hover:text-green-600">这个</a>，通常如果推荐尝试字体里没有你喜欢的，你可以自己找喜欢的字体在这里配置。
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600">字体名称：</label>
          <input
            type="text"
            v-model="fontSettings.fontName"
            @change="saveFontSettings"
            placeholder="请输入字体名称，例如：'Noto Serif SC', serif"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:bg-gray-700 dark:text-gray-300 text-gray-800 bg-gray-100 transition-colors duration-300 hover:border-green-500"
          />
          <p class="text-sm text-gray-600">
            输入CSS中定义的字体名称，如有多个备选字体请用逗号分隔
          </p>

          <div class="mt-4">
            <div class="text-base text-gray-600 mb-3">字体预览：</div>
            <div
              class="p-6 border border-gray-300 rounded-lg dark:bg-gray-700 bg-gray-100 dark:text-gray-300 shadow-sm"
              :style="{ fontFamily: fontFamily }"
            >
              <p class="mb-3">你好，欢迎使用书空应用！</p>
              <p class="mb-3">这是自定义字体的预览效果。</p>
              <p class="mb-3">汉字：永字八法 - 永恒的艺术</p>
              <p class="mb-3">英文：The quick brown fox jumps over the lazy dog.</p>
              <p>数字：0123456789</p>
            </div>
            <div v-if="fontLoading" class="mt-3 text-blue-500">
              字体加载中...
            </div>
            <div v-if="fontError" class="mt-3 text-red-500">
              字体加载失败，请检查CDN链接和字体名称是否正确
            </div>
            <div v-if="fontLoaded" class="mt-3 text-green-500">
              字体加载成功
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-300" v-if="isSpeechSupported" id="voice-settings">
      <h2 class="text-xl font-medium dark:text-gray-400 text-gray-800 mb-5 pb-3 border-b border-gray-300">朗读设置</h2>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600 dark:text-gray-300">选择朗读汉字时使用的默认语音：</label>
          <select
            v-model="voiceSettings.defaultVoice"
            @change="saveVoiceSettings"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:bg-gray-700 dark:text-gray-300 text-gray-800 bg-gray-100 cursor-pointer transition-colors duration-300 hover:border-green-500"
          >
            <option
              v-for="voice in voices"
              :key="voice.name"
              :value="voice.name"
            >
              {{ voice.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600 dark:text-gray-300">朗读速度：</label>
          <div class="flex items-center gap-4">
            <input
              type="range"
              v-model.number="voiceSettings.speakRate"
              min="0.1"
              max="2"
              step="0.1"
              @change="saveVoiceSettings"
              class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="min-w-[40px] text-base text-gray-600">{{ voiceSettings.speakRate }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600 dark:text-gray-300">自动播放声音：</label>
          <div
            class="flex items-center gap-2 cursor-pointer"
            @click="
              () => {
                voiceSettings.autoPlay = !voiceSettings.autoPlay
                saveVoiceSettings()
              }
            "
          >
            <input
              type="checkbox"
              v-model="voiceSettings.autoPlay"
              @change="saveVoiceSettings"
              class="w-4 h-4 text-green-500 bg-gray-100 border border-gray-300 rounded cursor-pointer focus:ring-green-500"
            />
            <label class="cursor-pointer text-gray-800 dark:text-gray-300">弹窗自动播放文字发音</label>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-300">测试朗读</h3>
            <p class="text-sm text-gray-600">输入文本并点击播放按钮测试当前语音设置</p>
          </div>
          <div class="flex gap-2">
            <input
              v-model="testText"
              placeholder="请输入要测试的文本"
              class="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-base dark:text-gray-300 text-gray-800 bg-gray-100 dark:bg-gray-700 transition-colors duration-300 hover:border-green-500"
            />
            <button
              @click="playTestText"
              class="px-4 py-2.5 bg-transparent border border-gray-300 rounded-lg text-gray-800 cursor-pointer transition-colors duration-200 hover:text-primary-500 hover:border-primary-100"
              title="播放"
            >
              <i class="fas fa-play"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-300" id="quiz-settings">
      <h2 class="text-xl font-medium dark:text-gray-400 text-gray-800 mb-5 pb-3 border-b border-gray-300">书空设置</h2>
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600">调整书空练习时汉字显示的大小：</label>
          <div class="flex items-center gap-4">
            <input
              type="range"
              v-model.number="quizSettings.containerSize"
              min="100"
              max="800"
              step="50"
              @change="saveQuizSettings"
              class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="min-w-[80px] text-base text-gray-600">{{ quizSettings.containerSize }}像素</span>
          </div>
          <p class="text-sm text-gray-600">可设置范围：100-800像素</p>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600">最大行数限制：</label>
          <div class="flex items-center gap-4">
            <input
              type="range"
              v-model.number="quizSettings.maxLines"
              min="1"
              max="100"
              step="1"
              @change="saveQuizSettings"
              class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="min-w-[80px] text-base text-gray-600">{{ quizSettings.maxLines }}行</span>
          </div>
          <p class="text-sm text-gray-600">可设置范围：1-100行</p>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600">每行最大字数限制：</label>
          <div class="flex items-center gap-4">
            <input
              type="range"
              v-model.number="quizSettings.maxCharsPerLine"
              min="1"
              max="100"
              step="1"
              @change="saveQuizSettings"
              class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="min-w-[80px] text-base text-gray-600">{{ quizSettings.maxCharsPerLine }}字</span>
          </div>
          <p class="text-sm text-gray-600">可设置范围：1-100字</p>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-base text-gray-600">画笔宽度：</label>
          <div class="flex items-center gap-4">
            <input
              type="range"
              v-model.number="quizSettings.drawingWidth"
              min="10"
              max="100"
              step="1"
              @change="saveQuizSettings"
              class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <span class="min-w-[80px] text-base text-gray-600">{{ quizSettings.drawingWidth }}像素</span>
          </div>
          <p class="text-sm text-gray-600">可设置范围：10-100像素</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
