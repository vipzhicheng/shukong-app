<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RightNav from '../components/RightNav.vue'

const router = useRouter()
const inputText = ref('')

const handleQuery = () => {
  // 过滤非汉字字符
  const chars = Array.from(inputText.value).filter(char => {
    return /[一-龥]/.test(char)
  })

  if (chars.length > 0) {
    router.push(`/query/${encodeURIComponent(chars.join(''))}`)
  }
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a @click="navigateTo('/recommended')">推荐故事</a>
        <a @click="navigateTo('/popular')">热门故事</a>
        <a @click="navigateTo('/today')">今日学习</a>
      </div>
    </div>
  </RightNav>
  <div class="container">
    <div class="input-section">
      <input
        v-model="inputText"
        placeholder="请输入汉字"
        class="input-field"
        @keyup.enter="handleQuery"
      />
      <button @click="handleQuery" class="query-button">查询笔顺</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

.input-section {
  display: flex;
  gap: 15px;
  width: 100%;
}

.input-field {
  flex: 1;
  padding: 12px 18px;
  font-size: 24px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.query-button {
  padding: 12px 24px;
  font-size: 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.query-button:hover {
  background-color: #45a049;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
  cursor: pointer;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: var(--text-color);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: var(--primary-color);
}
</style>