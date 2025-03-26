<script setup>
  import { onMounted } from 'vue'
  import { useThemeStore } from './store/theme'
  import SideNav from './components/SideNav.vue'
  import CartButton from './components/CartButton.vue'
  import BackToTop from './components/BackToTop.vue'

  const themeStore = useThemeStore()

  onMounted(() => {
    themeStore.initTheme()
  })
</script>

<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark">
    <SideNav />
    <main class="flex-1 min-h-screen bg-background dark:bg-background-dark pb-16 ml-0 md:ml-16 sm:ml-0">
      <router-view></router-view>
    </main>
    <BackToTop />
    <CartButton />
  </div>
</template>
