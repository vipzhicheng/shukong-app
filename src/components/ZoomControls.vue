<script setup>
defineProps({
  containerSize: {
    type: Number,
    required: true
  },
  minSize: {
    type: Number,
    required: true
  },
  maxSize: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['zoom-in', 'zoom-out'])

const handleZoomIn = () => {
  emit('zoom-in')
}

const handleZoomOut = () => {
  emit('zoom-out')
}
</script>

<template>
  <div class="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-2">
    <button
      @click="handleZoomIn"
      class="flex items-center justify-center w-12 h-12 cursor-pointer p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="containerSize >= maxSize"
    >
      <i class="fas fa-search-plus text-xl"></i>
    </button>
    <button
      @click="handleZoomOut"
      class="flex items-center justify-center w-12 h-12 cursor-pointer p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="containerSize <= minSize"
    >
      <i class="fas fa-search-minus text-xl"></i>
    </button>
  </div>
</template>