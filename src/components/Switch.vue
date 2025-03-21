<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  activeColor: {
    type: String,
    default: 'var(--primary-color)'
  },
  inactiveColor: {
    type: String,
    default: '#dcdfe6'
  },
  size: {
    type: String,
    default: 'default' // 可选值：small, default, large
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
      width: '40px',
      height: '20px',
      buttonSize: '16px'
    },
    default: {
      width: '48px',
      height: '24px',
      buttonSize: '20px'
    },
    large: {
      width: '56px',
      height: '28px',
      buttonSize: '24px'
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
    class="switch"
    :class="{
      'is-checked': modelValue,
      'is-disabled': disabled,
      [`switch-${size}`]: true
    }"
    :style="{
      '--switch-width': switchSize.width,
      '--switch-height': switchSize.height,
      '--button-size': switchSize.buttonSize,
      '--active-color': activeColor,
      '--inactive-color': inactiveColor
    }"
    @click="toggleSwitch"
  >
    <div class="switch-button"></div>
  </div>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: var(--switch-width);
  height: var(--switch-height);
  border-radius: calc(var(--switch-height) / 2);
  background-color: var(--inactive-color);
  cursor: pointer;
  transition: all 0.3s;
}

.switch.is-checked {
  background-color: var(--active-color);
}

.switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.switch-button {
  position: absolute;
  left: 2px;
  width: var(--button-size);
  height: var(--button-size);
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.switch.is-checked .switch-button {
  left: calc(100% - var(--button-size) - 2px);
}
</style>