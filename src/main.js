import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { checkSpeechSupport } from './store/speech'
import { loadFontSettings } from './store/font'

// 检查语音合成支持
checkSpeechSupport()

// 加载字体设置
loadFontSettings()

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')
