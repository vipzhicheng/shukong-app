<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="message-dialog-overlay"
        @click="handleOverlayClick"
      >
        <div class="message-dialog" :class="type" @click.stop>
          <div class="message-dialog-header">
            <div class="message-dialog-icon">
              <i :class="iconClass"></i>
            </div>
            <button class="close-button" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="message-dialog-content">
            {{ message }}
          </div>
          <div class="message-dialog-footer">
            <button class="confirm-button" @click="close">确定</button>
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

<style scoped>
  .message-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .message-dialog {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }

  .message-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .message-dialog-icon {
    font-size: 24px;
  }

  .success .message-dialog-icon {
    color: #4caf50;
  }

  .warning .message-dialog-icon {
    color: #ffc107;
  }

  .alert .message-dialog-icon {
    color: #2196f3;
  }

  .success .message-dialog-icon {
    color: #4caf50;
  }

  .warning .message-dialog-icon {
    color: #ffc107;
  }

  .error .message-dialog-icon {
    color: #f44336;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #333;
  }

  .message-dialog-content {
    margin-bottom: 20px;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    text-align: center;
  }

  .message-dialog-footer {
    display: flex;
    justify-content: center;
  }

  .confirm-button {
    background-color: #4a5568;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .confirm-button:hover {
    background-color: #2d3748;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
