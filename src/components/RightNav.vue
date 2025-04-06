<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import packageJson from '../../package.json'
  import '@fortawesome/fontawesome-free/css/all.css'
  import user from '../store/user'
  import AvatarSelector from './AvatarSelector.vue'

  const router = useRouter()
  const version = ref(packageJson.version)
  const showAvatarSelector = ref(false)
  const showSearchInput = ref(false)
  const searchQuery = ref('')

  const navigateToHome = () => {
    router.push('/')
  }

  const navigateToAbout = () => {
    router.push('/about')
  }

  const openAvatarSelector = () => {
    showAvatarSelector.value = true
  }

  const toggleSearchInput = () => {
    showSearchInput.value = !showSearchInput.value
    if (showSearchInput.value) {
      setTimeout(() => {
        document.getElementById('search-input').focus()
      }, 100)
    }
  }

  const handleSearch = () => {
    const query = searchQuery.value.trim()
    if (query) {
      router.push(`/query/${encodeURIComponent(query)}`)
      searchQuery.value = ''
      showSearchInput.value = false
    }
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
    <div class="flex items-center justify-end mr-4 gap-4">
      <slot name="right"></slot>
      <div class="relative flex items-center gap-4">
        <div class="flex items-center gap-2">
          <button @click="toggleSearchInput" class="text-text dark:text-text-dark hover:text-primary-500 dark:hover:text-primary-500 transition-colors duration-300">
            <i class="fas fa-search text-xl"></i>
          </button>
          <teleport to="body">
            <div v-if="showSearchInput" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" @click.self="toggleSearchInput">
          <div class="flex flex-col sm:flex-row gap-4 w-full max-w-lg md:p-0 p-4">
            <div class="flex-1 relative overflow-hidden rounded-lg p-0.5">
              <div class="absolute -top-[450%] -bottom-[450%] -left-1/2 -right-1/2 z-0 animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#00ff00,#0088ff,#ff0000)] rounded-lg"></div>
              <input
                id="search-input"
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                @keyup.esc="toggleSearchInput"
                type="text"
                placeholder="请输入汉字"
                class="relative z-10 w-full px-4 py-3 text-2xl bg-white dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-400 outline-none cursor-pointer transition-all duration-300 rounded-lg"
              >
            </div>
            <button
              @click="handleSearch"
              class="cursor-pointer px-6 py-3 text-2xl bg-primary-500 text-white rounded-lg hover:bg-opacity-90 transition-colors duration-300 whitespace-nowrap"
            >
              查询笔顺
            </button>
              </div>
            </div>
          </teleport>
        </div>
        <div class="flex items-center gap-2 cursor-pointer" @click="openAvatarSelector">
          <span class="text-text dark:text-text-dark hidden md:block">{{ user.getNickname() }}</span>
          <img :src="user.getAvatar()" :alt="user.getNickname()" class="w-8 h-8 rounded-full object-cover">
        </div>
      </div>
    </div>
    <AvatarSelector v-model:show="showAvatarSelector" />
  </div>
  <div class="fixed bottom-0 left-0 right-0 p-4 bg-background dark:bg-background-dark border-t border-border dark:border-border-dark flex justify-between items-center z-[1000] md:left-16">
    <div class="text-text-secondary dark:text-text-secondary-dark text-sm"></div>
    <div @click="navigateToAbout" class="font-bold text-base italic text-gray-800 dark:text-gray-200 cursor-pointer hover:text-primary-500 dark:hover:text-primary-500 transition-colors duration-300">书空 @2025</div>
    <div class="flex items-center gap-2">

      <div class="text-text-secondary dark:text-text-secondary-dark text-sm">v{{ version }}</div>
    </div>
  </div>
</template>
