<script setup>
  import { onMounted } from 'vue'
  import { useThemeStore } from './store/theme'
  import SideNav from './components/SideNav.vue'
  import CartButton from './components/CartButton.vue'

  const themeStore = useThemeStore()

  onMounted(() => {
    themeStore.initTheme()
  })
</script>

<template>
  <div class="app-container">
    <SideNav />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <CartButton />
  </div>
</template>

<style>
  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
  }

  :root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --border-color: #e0e0e0;
    --primary-color: #4caf50;
    --hover-color: rgba(76, 175, 80, 0.1);
    --active-color: rgba(76, 175, 80, 0.15);
  }

  :root.dark {
    --bg-color: #1a1a1a;
    --text-color: #c0c0c0;
    --border-color: #333333;
    --primary-color: #4caf50;
    --hover-color: rgba(76, 175, 80, 0.2);
    --active-color: rgba(76, 175, 80, 0.25);
    --secondary-bg-color: #242424;
    --secondary-text-color: #a0a0a0;
  }

  body {
    color: var(--text-color);
  }
</style>

<style scoped>
  .app-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--bg-color);
  }

  .main-content {
    flex: 1;
    margin-left: 64px;
    min-height: 100vh;
    background-color: var(--bg-color);
    padding-bottom: 4rem;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
  }
</style>
