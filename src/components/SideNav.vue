<script setup>
import { useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { useThemeStore } from '../store/theme'

const router = useRouter()
const themeStore = useThemeStore()

const navigateTo = (path) => {
  router.push(path)
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<template>
  <nav class="sidenav">
    <div class="logo" @click="navigateTo('/')">
      <div class="avatar">
        <i class="fas fa-user"></i>
      </div>
    </div>
    <div class="nav-links">
      <a @click="navigateTo('/')" :class="{ active: $route.path === '/' }" title="首页">
        <i class="fas fa-home"></i>
        <span class="nav-text">首页</span>
      </a>
      <a @click="navigateTo('/quiz')" :class="{ active: $route.path === '/quiz' }" title="书空">
        <i class="fas fa-pencil-alt"></i>
        <span class="nav-text">书空</span>
      </a>
      <a @click="navigateTo('/book')" :class="{ active: $route.path.startsWith('/book') }" title="教材">
        <i class="fas fa-book"></i>
        <span class="nav-text">字书</span>
      </a>
    </div>
    <div class="settings-link">
      <a @click="toggleTheme()" title="切换主题" class="icon-only">
        <i :class="['fas', themeStore.isDark ? 'fa-sun' : 'fa-moon']"></i>
      </a>
      <a @click="navigateTo('/settings')" :class="{ active: $route.path === '/settings' }" title="设置" class="icon-only">
        <i class="fas fa-cog"></i>
      </a>
    </div>
  </nav>
</template>

<style scoped>
.sidenav {
  width: 83px;
  height: 100%;
  min-height: -webkit-fill-available;
  background-color: var(--bg-secondary-color);
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  border-right: 1px solid var(--border-color);
  z-index: 1000;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.logo {
  width: 100%;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4CAF50;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.avatar i {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
  width: 100%;
  flex: 1;
}

.nav-links a, .settings-link a {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 0;
  color: var(--text-color, #666);
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.25rem;
}

.nav-links a:hover, .settings-link a:hover {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.nav-links a.active, .settings-link a.active {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.15);
}

.settings-link a.icon-only {
  padding: 0.5rem 0;
  background-color: transparent !important;
  color: inherit;
}

.settings-link a.icon-only {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.0rem;
  padding: 0.5rem 0;
}

.settings-link a.icon-only i {
  font-size: 1.5rem;
}

.nav-text {
  font-size: 0.9rem;
}

.settings-link {
  width: 100%;
  padding-bottom: 1rem;
}

:root {
  --bg-color: #f5f5f5;
  --text-color: #666;
  --border-color: #e0e0e0;
}

:root.dark {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --border-color: #333;
}
</style>