<script setup>
  import { useRouter } from 'vue-router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import { useThemeStore } from '../store/theme'
  import { ref } from 'vue'

  const router = useRouter()
  const themeStore = useThemeStore()
  const isMenuOpen = ref(false)

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
  <nav :class="['sidenav', { 'mobile-menu': isMenuOpen }]">
    <div class="nav-links">
      <a
        @click="navigateTo('/quiz')"
        :class="{ active: $route.path === '/quiz' }"
        title="首页"
      >
        <i class="fas fa-home"></i>
        <span class="nav-text">首页</span>
      </a>
      <a
        @click="navigateTo('/query')"
        :class="{ active: $route.path === '/query' }"
        title="查询笔顺"
      >
        <i class="fas fa-search"></i>
        <span class="nav-text">查询</span>
      </a>
      <a
        @click="navigateTo('/book')"
        :class="{ active: $route.path.startsWith('/book') }"
        title="教材"
      >
        <i class="fas fa-book"></i>
        <span class="nav-text">字书</span>
      </a>
    </div>
    <div class="settings-link">
      <a @click="toggleTheme()" title="切换主题" class="icon-only">
        <i :class="['fas', themeStore.isDark ? 'fa-sun' : 'fa-moon']"></i>
      </a>
      <a
        @click="navigateTo('/settings')"
        :class="{ active: $route.path === '/settings' }"
        title="设置"
        class="icon-only"
      >
        <i class="fas fa-cog"></i>
      </a>
      <div title="切换侧边栏" @click="toggleMenu" class="menu-toggle">
        <i :class="['fas', isMenuOpen ? 'fa-times' : 'fa-bars']"></i>
      </div>
    </div>
  </nav>
  <div v-if="isMenuOpen" class="overlay" @click="toggleMenu"></div>
</template>

<style scoped>
  .sidenav {
    width: 64px;
    height: 100%;
    min-height: -webkit-fill-available;
    background-color: var(--bg-secondary-color);
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid var(--border-color);
    z-index: 1002;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transition: all 0.3s ease;
  }

  .menu-toggle {
    display: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    position: fixed;
    z-index: 1001;
    bottom: 0rem;
    left: 1rem;
  }

  .mobile-menu .menu-toggle {
    position: inherit;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .sidenav {
      width: 64px;
      left: -64px;
      background-color: var(--bg-color);
    }

    .sidenav.mobile-menu {
      left: 0;
    }

    .menu-toggle {
      display: block;
    }

    .nav-links {
      width: 100%;
      align-items: center;
    }

    .nav-links a,
    .settings-link a {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      gap: 1rem;
    }

    .nav-text {
      font-size: 1.1rem;
    }

    .settings-link {
      flex-direction: row;
      justify-content: center;
      gap: 2rem;
    }
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
    background-color: #4caf50;
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
    padding: 0.5rem 0;
    width: 100%;
    flex: 1;
  }

  .nav-links a,
  .settings-link a {
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

  .nav-links a:hover,
  .settings-link a:hover {
    color: #4caf50;
    background-color: rgba(76, 175, 80, 0.1);
  }

  .nav-links a.active,
  .settings-link a.active {
    color: #4caf50;
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
    gap: 1rem;
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
  }
</style>
