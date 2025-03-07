<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="right-nav-container">
    <div class="left-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.right-nav-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .right-nav-container {
    padding: 0.75rem;
  }
}
</style>