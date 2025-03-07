<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')

const handleSearch = () => {
  if (query.value.trim()) {
    router.push(`/query/${encodeURIComponent(query.value.trim())}`)
    query.value = ''
  }
}
</script>

<template>
  <div class="right-nav-container">
    <div class="left-content">
      <slot></slot>
    </div>
    <div class="right-content">
      <form class="search-form" @submit.prevent="handleSearch">
        <input
          type="text"
          v-model="query"
          placeholder="输入汉字查询笔顺"
          class="search-input"
        />
        <button type="submit" class="search-button">
          <i class="fas fa-search"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.right-nav-container {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
}

.right-content {
  min-width: 240px;
  margin-right: 1rem;
}

.search-form {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.875rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .right-nav-container {
    grid-template-columns: 1fr;
  }

  .right-content {
    min-width: 100%;
  }
}
</style>