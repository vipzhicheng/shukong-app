<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import packageJson from '../../package.json'
import '@fortawesome/fontawesome-free/css/all.css'

const router = useRouter()
const version = ref(packageJson.version)

const navigateToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="right-nav-container">
    <div class="home-icon">
      <a @click="navigateToHome" class="home-link" title="首页">
        <i class="fas fa-home"></i>
      </a>
    </div>
    <div class="left-content">
      <slot></slot>
    </div>

  </div>
  <div class="footer">
    <div class="slogan"></div>
    <div class="ai-driven">Proudly driven by AI</div>
    <div class="footer-right">
      <a href="https://github.com" target="_blank" class="github-link" title="访问 Github">
        <i class="fab fa-github"></i>
      </a>
      <div class="version">v{{ version }}</div>
    </div>
  </div>
</template>

<style scoped>
.right-nav-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.home-icon {
  display: none;
}

.home-link {
  display: flex;
  align-items: center;
  color: var(--text-color);
  text-decoration: none;
  font-size: 1.5rem;
  transition: color 0.3s ease;
  cursor: pointer;
  padding: 0.5rem;
}

.home-link:hover {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .home-icon {
    display: block;
    margin-right: 1rem;
  }
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

.footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.github-link {
  color: var(--secondary-text-color);
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.github-link:hover {
  color: var(--primary-color);
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
.left-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}


</style>

<style>

.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
  font-size: 1.1rem;
}

.nav-menu a {
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-menu a:hover {
  color: var(--primary-color);
  background-color: rgba(var(--primary-rgb), 0.1);
}

:deep(.nav-menu) a.active {
  color: var(--primary-color);
  font-weight: 500;
}
</style>