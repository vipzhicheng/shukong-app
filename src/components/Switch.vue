<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },

  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const switchSize = computed(() => {
  const sizes = {
    small: {
      containerClass: 'w-10 h-5',
      buttonClass: 'w-4 h-4'
    },
    default: {
      containerClass: 'w-12 h-6',
      buttonClass: 'w-5 h-5'
    },
    large: {
      containerClass: 'w-14 h-7',
      buttonClass: 'w-6 h-6'
    }
  }
  return sizes[props.size] || sizes.default
})

const toggleSwitch = (event) => {
  if (props.disabled) return
  event.stopPropagation()
  event.preventDefault()
  emit('update:modelValue', !props.modelValue)
  emit('change', !props.modelValue)
}
</script>

<template>
  <div
    :class="[
      switchSize.containerClass,
      'relative inline-flex items-center rounded-full cursor-pointer',
      modelValue ? 'bg-primary-500 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600',
      disabled ? 'opacity-60 cursor-not-allowed' : ''
    ]"
    @click="toggleSwitch"
  >
    <div
      :class="[
        switchSize.buttonClass,
        'absolute rounded-full bg-white dark:bg-gray-200 shadow-md transform',
        modelValue ? '-translate-x-0.5 right-0' : 'translate-x-0.5',
      ]"
    ></div>
  </div>
</template>
