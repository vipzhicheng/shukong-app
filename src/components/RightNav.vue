<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import packageJson from '../../package.json'
  import '@fortawesome/fontawesome-free/css/all.css'

  const router = useRouter()
  const version = ref(packageJson.version)

  const navigateToHome = () => {
    router.push('/')
  }
</script>

<template>
  <div class="relative w-full flex items-center justify-between p-1.5 bg-background dark:bg-background-dark border-b border-border dark:border-border-dark max-w-[100vw] overflow-x-hidden shadow-sm backdrop-blur-md">
    <div class="md:hidden block" v-show="$route.path !== '/quiz'">
      <a @click="navigateToHome" class="flex items-center text-2xl text-text dark:text-text-dark p-2 cursor-pointer hover:text-primary-500 dark:hover:text-primary-500 transition-colors duration-300" title="首页">
        <i class="fas fa-home"></i>
      </a>
    </div>
    <div class="flex-1 flex items-center justify-start">
      <slot></slot>
    </div>
    <div v-if="$slots.right" class="flex-1 flex items-center justify-end mr-4 gap-4">
      <slot name="right"></slot>
    </div>
  </div>
  <div class="fixed bottom-0 left-0 right-0 p-4 bg-background dark:bg-background-dark border-t border-border dark:border-border-dark flex justify-between items-center z-[1000] md:left-16">
    <div class="text-text-secondary dark:text-text-secondary-dark text-sm"></div>
    <div class="font-bold text-base italic">学笔顺用书空 @2025</div>
    <div class="flex items-center gap-2">
      <a
        href="https://github.com"
        target="_blank"
        class="text-text-secondary dark:text-text-secondary-dark text-xl hover:text-primary-500 dark:hover:text-primary-500 transition-colors duration-300"
        title="访问 Github"
      >
        <i class="fab fa-github"></i>
      </a>
      <div class="text-text-secondary dark:text-text-secondary-dark text-sm">v{{ version }}</div>
    </div>
  </div>
</template>
