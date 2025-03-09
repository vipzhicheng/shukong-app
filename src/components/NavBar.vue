<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const isMenuOpen = ref(false)

const navigateTo = (path) => {
  router.push(path)
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo" @click="navigateTo('/')">
        书空
      </div>
      <div class="spacer"></div>
      <div class="menu-icon" @click="toggleMenu">
        <div :class="['bar', { 'open': isMenuOpen }]"></div>
        <div :class="['bar', { 'open': isMenuOpen }]"></div>
        <div :class="['bar', { 'open': isMenuOpen }]"></div>
      </div>
      <div :class="['nav-links', { 'open': isMenuOpen }]">
        <a @click="navigateTo('/')" :class="{ active: $route.path === '/' }">首页</a>
        <a @click="navigateTo('/quiz')" :class="{ active: $route.path === '/quiz' }">书空</a>
        <a @click="navigateTo('/book')" :class="{ active: $route.path.startsWith('/book') }">教材</a>
        <a @click="navigateTo('/settings')" :class="{ active: $route.path === '/settings' }">设置</a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

.spacer {
  flex: 1;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
  font-family: "Kaiti SC", "Kaiti TC", "楷体", "楷体_GB2312", "KaiTi", "Hiragino Mincho ProN", "KaiTi_GB2312", "STKaiti", "Hiragino Sans GB", "DFKai-SB", serif;
  cursor: pointer;
  user-select: none;
  padding: 1rem;
}

.menu-icon {
  display: none;
  flex-direction: column;
  gap: 6px;
  padding: 1rem;
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1001;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.nav-links {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 2rem;
  padding: 1rem;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: #333;
  transition: all 0.3s ease;
}

.bar.open:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.bar.open:nth-child(2) {
  opacity: 0;
}

.bar.open:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

.nav-links {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 2rem;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #4CAF50;
}

.nav-links a.active {
  color: #4CAF50;
  font-weight: bold;
}

@media (max-width: 768px) {
  .menu-icon {
    display: flex;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #f5f5f5;
    grid-template-columns: 1fr;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .nav-links.open {
    display: grid;
  }

  .nav-links a {
    padding: 0.5rem 0;
  }
}
</style>