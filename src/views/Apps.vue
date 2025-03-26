<script setup>
import RightNav from '../components/RightNav.vue'
import Switch from '../components/Switch.vue'
import apps from '../utils/apps'
import '@fortawesome/fontawesome-free/css/all.css'
import { useAppsStore } from '../store/apps'

const appsStore = useAppsStore()
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-300 p-4">应用中心</h1>
      </div>
    </div>
  </RightNav>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="app in apps" :key="app.title" class="relative flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
        <div class="absolute top-4 right-4">
          <Switch :model-value="appsStore.appStates.find(state => state.path === app.path)?.enabled || false" @update:model-value="() => appsStore.toggleApp(app.path)" size="small" />
        </div>
        <div v-if="!app.image">
          <router-link :to="app.path" class="w-24 h-24 mb-6 rounded-full flex items-center justify-center text-4xl bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-500 transition-all duration-300 hover:scale-110">
            <i :class="app.navIcon"></i>
          </router-link>
        </div>
        <div v-else>
          <router-link :to="app.path">
            <img :src="app.image" :alt="app.title" class="w-full max-w-[200px] h-auto mb-6 rounded-lg" />
          </router-link>
        </div>
        <div>
          <router-link :to="app.path" class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
            {{ app.title }}
          </router-link>
        </div>
        <div>
          <router-link :to="app.path" class="text-gray-600 dark:text-gray-400 text-center leading-relaxed hover:text-primary-600 dark:hover:text-primary-500">
            {{ app.description }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
