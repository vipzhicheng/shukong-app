<script setup>
import { ref, onMounted } from 'vue'
import '@fortawesome/fontawesome-free/css/all.css'
import RightNav from '../components/RightNav.vue'
import { loadResource } from '../utils/resourceLoader'
const books = ref([])
const jiujiuBooks = ref([])

const loadBooks = async () => {
  try {
    const data = await loadResource('books/renjiao.json')
    const formattedBooks = []

    data.grades.forEach(grade => {
      grade.volumes.forEach(volume => {
        formattedBooks.push({
          grade: grade.grade,
          term: volume.term
        })
      })
    })

    books.value = formattedBooks
  } catch (error) {
    console.error('Error loading books:', error)
  }
}

const loadJiujiuBooks = async () => {
  try {
    const data = await loadResource('books/jiujiu.json')
    const formattedBooks = []

    data.grades.forEach(grade => {
      grade.volumes.forEach((volume, index) => {
        formattedBooks.push({
          grade: grade.grade,
          term: volume.term,
          volume: volume.volume
        })
      })
    })

    jiujiuBooks.value = formattedBooks
  } catch (error) {
    console.error('Error loading jiujiu books:', error)
  }
}

onMounted(() => {
  loadBooks()
  loadJiujiuBooks()
})
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold;">字书</a>
      </div>
    </div>
  </RightNav>
  <div class="container px-4 py-0">
    <h2 class="section-title">教材书</h2>
    <div class="book-grid">
      <div v-for="volume in books" :key="volume.grade + '-' + volume.term" class="book-card">
        <router-link :to="`/renjiao/${volume.grade}`" class="book-link">
          <div class="book">
            <i class="fas fa-book book-icon"></i>
            <div class="book-title">
              <h2>{{ volume.term }}</h2>
              <p>人教版语文</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <h2 class="section-title mt-8">久久积累</h2>
    <div class="book-grid">
      <div v-for="volume in jiujiuBooks" :key="volume.grade + '-' + volume.term" class="book-card">
        <router-link :to="`/jiujiu/${volume.grade}${volume.volume}`" class="book-link">
          <div class="book" style="background-color: #2196F3;">
            <i class="fas fa-book book-icon"></i>
            <div class="book-title">
              <h2>{{ volume.term }}</h2>
              <p>久久积累</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2rem;
  margin: 1rem auto 0;
  padding: 0 1rem;
  max-width: 1600px;
}

.book-card {
  aspect-ratio: 2/3;
  min-width: 200px;
  max-width: 100%;
  margin: 0 auto;
}

.book-link {
  display: block;
  height: 100%;
  text-decoration: none;
}

.book {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  position: relative;
}

.book::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%,
    transparent
  );
  background-size: 30px 30px;
  opacity: 0.3;
}

.book-icon {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.9);
  z-index: 1;
}

.book-title {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  padding: 0.5rem;
  color: white;
  text-align: center;
}

.book-title h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.book-title p {
  font-size: 0.875rem;
  opacity: 0.9;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: var(--text-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: var(--primary-color);
}

@media (max-width: 1500px) {
  .book-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .book-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 760px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 0.5rem;
  }
  .book-icon {
    font-size: 6rem;
  }
}

@media (max-width: 450px) {
  .book-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }

  .book-card {
    width: 100%;
    max-width: none;
    margin: 0;
  }
}

.section-title {
  font-size: 2.8rem;
  font-weight: bold;
  margin: 5rem 0 3.5rem;
  color: var(--text-color);
}
</style>

