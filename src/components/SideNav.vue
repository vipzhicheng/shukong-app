<script setup>
import { useRouter } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import { useThemeStore } from '../store/theme'
import { useAppsStore } from '../store/apps'
import { ref, computed } from 'vue'

const router = useRouter()
const themeStore = useThemeStore()
const appsStore = useAppsStore()
const isMenuOpen = ref(false)

const enabledApps = computed(() => appsStore.getEnabledApps())

const navigateTo = path => {
  router.push(path)
  isMenuOpen.value = false
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <nav :class="[
    'fixed md:left-0 -left-16 top-0 h-full min-h-screen w-16 flex flex-col items-center border-r border-border dark:border-border-dark bg-background-secondary dark:bg-background-secondary-dark z-[1002] overflow-y-auto transition-all duration-300 ease-in-out',
    { 'left-0 bg-background dark:bg-background-dark md:left-0': isMenuOpen },
  ]">
    <div class="flex flex-col gap-4 py-2 w-full flex-1">
      <a
        @click="navigateTo('/quiz')"
        :class="[
          'flex flex-col items-center justify-center py-3 cursor-pointer transition-all duration-300 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary hover:bg-primary/10',
          { 'text-primary dark:text-primary': $route.path === '/quiz' }
        ]"
        title="首页"
      >
        <i class="fas fa-home text-xl"></i>
        <span class="text-xs mt-1">首页</span>
      </a>
      <template v-for="app in enabledApps" :key="app.path">
        <a
          @click="navigateTo(app.path)"
          :class="[
            'flex flex-col items-center justify-center py-3 cursor-pointer transition-all duration-300 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary hover:bg-primary/10',
            { 'text-primary dark:text-primary': $route.path.startsWith(app.path) }
          ]"
          :title="app.title"
        >
          <i :class="[app.navIcon, 'text-xl']"></i>
          <span class="text-xs mt-1">{{ app.navLabel }}</span>
        </a>
      </template>
      <a
        @click="navigateTo('/apps')"
        :class="[
          'flex flex-col items-center justify-center py-3 cursor-pointer transition-all duration-300 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary hover:bg-primary/10',
          { 'text-primary dark:text-primary': $route.path === '/apps' }
        ]"
        title="扩展"
      >
        <i class="fas fa-puzzle-piece text-xl"></i>
        <span class="text-xs mt-1">扩展</span>
      </a>
    </div>
    <div class="w-full">
      <a
        @click="toggleTheme()"
        class="flex flex-col items-center justify-center py-2 cursor-pointer transition-all duration-300 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary"
        title="切换主题"
      >
        <i :class="['fas text-xl', themeStore.isDark ? 'fa-sun' : 'fa-moon']"></i>
      </a>
      <a
        @click="navigateTo('/settings')"
        :class="[
          'mb-16 flex flex-col items-center justify-center py-2 cursor-pointer transition-all duration-300 text-text dark:text-text-dark hover:text-primary dark:hover:text-primary',
          { 'text-primary dark:text-primary': $route.path === '/settings' }
        ]"
        title="设置"
      >
        <i class="fas fa-cog text-xl"></i>
      </a>
      <div
        class="md:hidden fixed bottom-2 left-4 z-[1001] p-2 cursor-pointer text-text dark:text-text-dark hover:text-primary dark:hover:text-primary transition-all duration-300"
        title="切换侧边栏"
        @click="toggleMenu"
      >
        <i :class="['fas text-2xl', isMenuOpen ? 'fa-times' : 'fa-bars']"></i>
      </div>
    </div>
  </nav>
  <div
    v-if="isMenuOpen"
    class="fixed inset-0 bg-black/50 z-[999] animate-fade-in md:hidden"
    @click="toggleMenu"
  ></div>
</template>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease forwards;
}
</style>
