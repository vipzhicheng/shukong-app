<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]"
        @click="handleOverlayClick"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg w-[90%] max-w-[400px] p-5 shadow-lg"
          :class="{
            'text-gray-900 dark:text-gray-100': true,
          }"
          @click.stop
        >
          <div class="flex justify-between items-center mb-4">
            <div>
              <i :class="[iconClass, {
                'text-green-500': type === 'success',
                'text-yellow-500': type === 'warning',
                'text-blue-500': type === 'alert',
                'text-red-500': type === 'error'
              }, 'text-2xl']"></i>
            </div>
            <button
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg p-1 transition-colors"
              @click="close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="mb-5 text-base leading-relaxed text-center">
            {{ message }}
          </div>
          <div class="flex justify-center">
            <button
              class="cursor-pointer bg-primary hover:bg-primary text-white px-6 py-2 rounded text-sm transition-colors"
              @click="close"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    type: {
      type: String,
      default: 'alert',
      validator: value => ['success', 'warning', 'alert'].includes(value)
    },
    message: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['update:visible', 'close'])

  const iconClass = computed(() => {
    const icons = {
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      alert: 'fas fa-info-circle',
      error: 'fas fa-exclamation-triangle'
    }
    return icons[props.type]
  })

  const close = () => {
    emit('update:visible', false)
    emit('close')
  }

  const handleOverlayClick = () => {
    if (props.closeOnClickOverlay) {
      close()
    }
  }
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 11.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
