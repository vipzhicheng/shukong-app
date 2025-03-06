import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
    mode: localStorage.getItem('themeMode') || 'light' // 'light', 'dark', 'system'
  }),
  actions: {
    toggleTheme() {
      if (this.mode === 'system') {
        this.mode = this.isDark ? 'light' : 'dark'
      } else {
        this.mode = this.mode === 'light' ? 'dark' : 'light'
      }
      this.applyTheme()
      localStorage.setItem('themeMode', this.mode)
    },
    initTheme() {
      this.applyTheme()
      if (this.mode === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (this.mode === 'system') {
            this.isDark = e.matches
            document.documentElement.classList.toggle('dark', e.matches)
          }
        })
      }
    },
    applyTheme() {
      if (this.mode === 'system') {
        this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        this.isDark = this.mode === 'dark'
      }
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})