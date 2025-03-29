<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import user from '../store/user'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const nickname = ref(user.getNickname())
const selectedAvatar = ref(user.getAvatar())

const avatars = Array.from({ length: 20 }, (_, i) => `/avatars/${String(i + 1).padStart(2, '0')}.png`)

const saveUserInfo = () => {
  user.setNickname(nickname.value)
  user.setAvatar(selectedAvatar.value)
  emit('update:show', false)
}

const closeDialog = () => {
  emit('update:show', false)
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.show) {
    closeDialog()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" @click.self="closeDialog">
      <div class="bg-background dark:bg-background-dark rounded-lg p-6 w-[90%] max-w-[480px] max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-text dark:text-text-dark">个性化设置</h2>
        <button @click="closeDialog" class="text-text-secondary dark:text-text-secondary-dark hover:text-primary-500 dark:hover:text-primary-500">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mb-6">
        <label class="block text-text dark:text-text-dark mb-2">昵称</label>
        <input
          v-model="nickname"
          type="text"
          class="w-full px-4 py-2 rounded-lg border border-border dark:border-border-dark bg-background-secondary dark:bg-background-secondary-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="请输入昵称"
        >
      </div>

      <div class="mb-6">
        <label class="block text-text dark:text-text-dark mb-2">头像</label>
        <div class="grid grid-cols-5 gap-4">
          <div
            v-for="avatar in avatars"
            :key="avatar"
            @click="selectedAvatar = avatar"
            class="relative aspect-square cursor-pointer rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all duration-300"
            :class="{ 'ring-2 ring-primary-500': selectedAvatar === avatar }"
          >
            <img :src="avatar" :alt="avatar" class="w-full h-full object-cover">
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button
          @click="closeDialog"
          class="px-4 py-2 rounded-lg border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors duration-300"
        >
          取消
        </button>
        <button
          @click="saveUserInfo"
          class="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-300"
        >
          保存
        </button>
        </div>
      </div>
    </div>
  </teleport>
</template>