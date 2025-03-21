import { defineStore } from 'pinia'
import apps from '../utils/apps'

export const useAppsStore = defineStore('apps', {
  state: () => ({
    appStates:
      JSON.parse(localStorage.getItem('appStates')) ||
      apps.map(app => ({
        path: app.path,
        enabled: false
      }))
  }),
  actions: {
    toggleApp(path) {
      const appState = this.appStates.find(state => state.path === path)
      if (appState) {
        if (appState.enabled) {
          this.appStates = this.appStates.filter(state => state.path !== path)
        } else {
          appState.enabled = true
        }
      } else {
        this.appStates.push({
          path,
          enabled: true
        })
      }
      localStorage.setItem('appStates', JSON.stringify(this.appStates))
    },
    getEnabledApps() {
      const enabledStates = this.appStates.filter(state => state.enabled)
      return enabledStates
        .map(state => apps.find(app => app.path === state.path))
        .filter(Boolean)
    }
  }
})
