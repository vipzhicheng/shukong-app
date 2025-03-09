<script setup>
import { ref, onMounted } from 'vue'
import { isSpeechSupported } from '../store/speech'
import { useThemeStore } from '../store/theme'
import RightNav from '../components/RightNav.vue'

const themeStore = useThemeStore()
const themeSettings = ref({
  mode: themeStore.mode
})

const saveThemeSettings = () => {
  themeStore.mode = themeSettings.value.mode
  localStorage.setItem('themeMode', themeSettings.value.mode)
  themeStore.applyTheme()
}

const voices = ref([])
const voiceSettings = ref({
  defaultVoice: '',
  speakRate: 1,
  autoPlay: false
})

const quizSettings = ref({
  containerSize: 500,
  maxLines: 20,
  maxCharsPerLine: 5
})

const autoPlaySettings = ref({
  autoPlay: false
})

const testText = ref('你好，欢迎使用书空')

const loadSettings = () => {
  const savedAutoPlaySettings = localStorage.getItem('autoPlaySettings')
  if (savedAutoPlaySettings) {
    autoPlaySettings.value = Object.assign(autoPlaySettings.value, JSON.parse(savedAutoPlaySettings))
  }
  const savedVoiceSettings = localStorage.getItem('voiceSettings')
  if (savedVoiceSettings) {
    voiceSettings.value = Object.assign(voiceSettings.value, JSON.parse(savedVoiceSettings))
  }

  const savedQuizSettings = localStorage.getItem('quizSettings')
  if (savedQuizSettings) {
    quizSettings.value = Object.assign(quizSettings.value, JSON.parse(savedQuizSettings))
  }
}

const saveVoiceSettings = () => {
  localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings.value))
}

const saveQuizSettings = () => {
  localStorage.setItem('quizSettings', JSON.stringify(quizSettings.value))
}

const saveAutoPlaySettings = () => {
  localStorage.setItem('autoPlaySettings', JSON.stringify(autoPlaySettings.value))
}

const updateVoices = () => {
  // 获取所有语音并过滤出中文语音
  const allVoices = window.speechSynthesis.getVoices()
  // 使用 Set 去重，确保相同名称的语音只会出现一次
  const uniqueVoices = new Map()
  allVoices
    .filter(voice => voice.lang.startsWith('zh') || voice.lang === 'zh-CN')
    .forEach(voice => {
      if (!uniqueVoices.has(voice.name)) {
        uniqueVoices.set(voice.name, voice)
      }
    })
  voices.value = Array.from(uniqueVoices.values())
}

const playTestText = () => {
  if (!isSpeechSupported.value || !testText.value) return
  const synth = window.speechSynthesis
  // 取消当前正在播放的语音
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(testText.value)
  const selectedVoice = synth.getVoices().find(voice => voice.name === voiceSettings.value.defaultVoice)
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }
  utterance.lang = 'zh-CN'
  utterance.rate = voiceSettings.value.speakRate || 0.1
  synth.speak(utterance)
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const offset = 80 // 顶部导航栏的高度
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  loadSettings()
  if (isSpeechSupported.value) {
    updateVoices()
    window.speechSynthesis.onvoiceschanged = updateVoices
  }
})
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold;">设置</a>
      </div>
    </div>
  </RightNav>
  <div class="settings-container">
    <div class="floating-menu">
      <a @click="scrollToSection('general-settings')" class="menu-item">通用配置</a>
      <a @click="scrollToSection('voice-settings')" class="menu-item">朗读设置</a>
      <a @click="scrollToSection('quiz-settings')" class="menu-item">书空设置</a>
    </div>
    <div class="settings-card" id="general-settings">
      <h2 class="settings-subtitle">通用配置</h2>
      <div class="settings-content">
        <div class="settings-item">
          <label>主题：</label>
          <div class="theme-options">
            <label class="theme-option">
              <input
                type="radio"
                v-model="themeSettings.mode"
                value="light"
                @change="saveThemeSettings"
              />
              <span>亮色</span>
            </label>
            <label class="theme-option">
              <input
                type="radio"
                v-model="themeSettings.mode"
                value="dark"
                @change="saveThemeSettings"
              />
              <span>暗色</span>
            </label>
            <label class="theme-option">
              <input
                type="radio"
                v-model="themeSettings.mode"
                value="system"
                @change="saveThemeSettings"
              />
              <span>跟随系统</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="settings-card" v-if="isSpeechSupported" id="voice-settings">
      <h2 class="settings-subtitle">朗读设置</h2>
      <div class="settings-content">

        <div class="settings-item">
          <label>选择朗读汉字时使用的默认语音：</label>
          <select v-model="voiceSettings.defaultVoice" @change="saveVoiceSettings" class="settings-select">
            <option v-for="voice in voices" :key="voice.name" :value="voice.name">
              {{ voice.name }}
            </option>
          </select>
        </div>



        <div class="settings-item">
          <label>朗读速度：</label>
          <div class="settings-slider-container">
            <input
              type="range"
              v-model.number="voiceSettings.speakRate"
              min="0.1"
              max="2"
              step="0.1"
              @change="saveVoiceSettings"
              class="settings-slider"
            />
            <span class="settings-value">{{ voiceSettings.speakRate }}</span>
          </div>
        </div>

        <div class="settings-item">
          <label>自动播放声音：</label>
          <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" @click="() => { voiceSettings.autoPlay = !voiceSettings.autoPlay; saveVoiceSettings(); }">
            <input
              type="checkbox"
              v-model="voiceSettings.autoPlay"
              @change="saveVoiceSettings"
              class="settings-checkbox"
            />
            <label style="cursor: pointer;">弹窗自动播放文字发音</label>
          </div>
        </div>

        <div class="settings-item">
          <div class="setting-header">
            <h3 class="setting-title">测试朗读</h3>
            <p class="setting-description">输入文本并点击播放按钮测试当前语音设置</p>
          </div>
          <div class="test-voice-container">
            <input
              v-model="testText"
              placeholder="请输入要测试的文本"
              class="test-voice-input"
            />
            <button
              @click="playTestText"
              class="test-voice-button"
              title="播放"
            >
              <i class="fas fa-play"></i>
            </button>
          </div>
        </div>
      </div>
    </div>



    <div class="settings-card" id="quiz-settings">
      <h2 class="settings-subtitle">书空设置</h2>
      <div class="settings-content">
        <div class="settings-item">
          <label>调整书空练习时汉字显示的大小：</label>
          <div class="settings-slider-container">
            <input
              type="range"
              v-model.number="quizSettings.containerSize"
              min="300"
              max="800"
              step="50"
              @change="saveQuizSettings"
              class="settings-slider"
            />
            <span class="settings-value">{{ quizSettings.containerSize }}像素</span>
          </div>
          <p class="settings-hint">可设置范围：300-800像素</p>
        </div>

        <div class="settings-item">
          <label>最大行数限制：</label>
          <div class="settings-slider-container">
            <input
              type="range"
              v-model.number="quizSettings.maxLines"
              min="1"
              max="100"
              step="1"
              @change="saveQuizSettings"
              class="settings-slider"
            />
            <span class="settings-value">{{ quizSettings.maxLines }}行</span>
          </div>
          <p class="settings-hint">可设置范围：1-100行</p>
        </div>

        <div class="settings-item">
          <label>每行最大字数限制：</label>
          <div class="settings-slider-container">
            <input
              type="range"
              v-model.number="quizSettings.maxCharsPerLine"
              min="1"
              max="100"
              step="1"
              @change="saveQuizSettings"
              class="settings-slider"
            />
            <span class="settings-value">{{ quizSettings.maxCharsPerLine }}字</span>
          </div>
          <p class="settings-hint">可设置范围：1-100字</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: var(--primary-color);
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 60px;
}

.settings-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.settings-card {
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.settings-subtitle {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-options {
  display: flex;
  gap: 20px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.theme-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.theme-option span {
  color: var(--text-color);
}

.settings-item label {
  font-size: 16px;
  color: #555;
}

.settings-select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-color);
  background-color: var(--bg-color);
  cursor: pointer;
  transition: border-color 0.3s;
}

.settings-select:hover {
  border-color: #4CAF50;
}

.settings-slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings-slider {
  flex: 1;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  cursor: pointer;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.settings-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.settings-value {
  min-width: 40px;
  font-size: 16px;
  color: #666;
}

.settings-size-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-input {
  width: 120px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: border-color 0.3s;
}

.settings-input:hover,
.settings-input:focus {
  border-color: #4CAF50;
  outline: none;
}

.settings-unit {
  font-size: 16px;
  color: #666;
}

.settings-hint {
  font-size: 14px;
  color: #888;
  margin-top: 8px;
}

.setting-header {
  margin-bottom: 16px;
}

.setting-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 14px;
  color: #666;
}

.test-voice-container {
  display: flex;
  gap: 12px;
}

.test-voice-input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: border-color 0.3s;
}

.test-voice-input:hover,
.test-voice-input:focus {
  border-color: #4CAF50;
  outline: none;
}

.test-voice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.test-voice-button:hover {
  background-color: #45a049;
}

.floating-menu {
  position: fixed;
  left: 100px;
  top: 100px;
  background-color: transparent;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.menu-item:hover {
  color: var(--primary-color);
}

@media screen and (max-width: 1200px) {
  .floating-menu {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }

  .settings-card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .settings-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .settings-subtitle {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .settings-content {
    gap: 16px;
  }

  .settings-item {
    gap: 8px;
  }
}
</style>