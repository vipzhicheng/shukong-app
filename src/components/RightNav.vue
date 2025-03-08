<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const starCount = ref(null)

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'm'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num ? num.toString() : ''
}

const fetchStarCount = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/logseq/logseq')
    const data = await response.json()
    starCount.value = data.stargazers_count
  } catch (error) {
    // 静默处理错误
    starCount.value = null
  }
}

onMounted(() => {
  fetchStarCount()
})
</script>

<template>
  <div class="right-nav-container">
    <div class="left-content">
      <slot></slot>
    </div>
    <div class="github-container">
      <a href="https://github.com/logseq/logseq" target="_blank" class="github-link">
        <i class="fab fa-github"></i>
        <span v-if="starCount !== null" class="star-count">{{ formatNumber(starCount) }}</span>
      </a>
    </div>
  </div>
  <div class="footer">
    <div class="slogan"></div>
    <div class="ai-driven">Proudly driven by AI</div>
    <div class="version">v0.0.1</div>
  </div>
</template>

<style scoped>
.right-nav-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.github-container {
  margin-left: auto;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  text-decoration: none;
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.github-link:hover {
  color: var(--primary-color);
}

.star-count {
  font-size: 1rem;
  background-color: var(--secondary-bg-color);
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 64px;
  right: 0;
  padding: 1rem;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.ai-driven {
  color: var(--secondary-text-color);
  font-size: 0.85rem;
  font-style: italic;
}

.slogan {
  color: var(--secondary-text-color);
  font-size: 0.9rem;
}

.version {
  color: var(--secondary-text-color);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .right-nav-container {
    padding: 1rem;
  }

  .footer {
    left: 0;
  }

  .slogan {
    margin-left: 64px;
  }
}
</style>