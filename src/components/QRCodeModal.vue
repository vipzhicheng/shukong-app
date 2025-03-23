<script setup>
import QRCode from 'qrcode.vue'
import '@fortawesome/fontawesome-free/css/all.css'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  url: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:show'])

const handleClose = () => {
console.log('close')
  emit('update:show', false)
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm z-[9999]" @click="handleClose">
    <div class="bg-white rounded-xl shadow-2xl w-80 overflow-hidden" @click.stop>
      <div class="px-6 py-4 border-b border-gray-200">
        <button class="close-button" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="p-6 flex flex-col items-center justify-center space-y-4">
        <QRCode :value="url" :size="200" level="H" />
        <h3 class="text-lg font-medium text-gray-800">手机扫码书空练习</h3>
      </div>
    </div>
  </div>
</template>