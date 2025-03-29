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
                'text-cyan-500': type === 'confirm',
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
          <div class="flex justify-center space-x-3">
            <button
              v-if="showCancelButton"
              class="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded text-sm transition-colors"
              @click="handleCancel"
            >
              取消
            </button>
            <button
              class="cursor-pointer bg-primary-500 hover:bg-primary-500 text-white px-6 py-2 rounded text-sm transition-colors"
              @click="ok"
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
      validator: value => ['success', 'warning', 'alert', 'confirm', 'error'].includes(value)
    },
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    onOk: {
      type: Function,
      default: null
    },
    onCancel: {
      type: Function,
      default: null
    }
  })

  const emit = defineEmits(['update:visible', 'close', 'ok', 'cancel'])

  const iconClass = computed(() => {
    const icons = {
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      alert: 'fas fa-info-circle',
      error: 'fas fa-exclamation-triangle',
      confirm: 'fas fa-question-circle'
    }
    return icons[props.type]
  })

  const close = () => {
    emit('update:visible', false)
    emit('close')

  }

  const ok = () => {
    emit('update:visible', false)
    emit('close')
    if (props.onOk) {
      props.onOk()
    }
    emit('ok')
  }

  const handleCancel = () => {
    emit('update:visible', false)
    emit('close')
    if (props.onCancel) {
      props.onCancel()
    }
    emit('cancel')
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
