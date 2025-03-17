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
        grade.volumes.forEach(volume => {
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
  // 静态展示，不需要动态数据
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold">字书</a>
      </div>
    </div>
  </RightNav>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">选择字书</h1>
    <div class="book-grid">
      <div class="book-card">
        <router-link to="/book/renjiao" class="book-link">
          <div class="book" style="background-color: #4caf50">
            <i class="fas fa-book book-icon"></i>
            <div class="book-title">
              <h2>部编版语文</h2>
              <p>小学语文教材</p>
            </div>
          </div>
        </router-link>
      </div>
      <div class="book-card">
        <router-link to="/book/jiujiu" class="book-link">
          <div class="book" style="background-color: #2196f3">
            <i class="fas fa-book book-icon"></i>
            <div class="book-title">
              <h2>久久积累</h2>
              <p>小学诗词启蒙</p>
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin: 1rem auto 0;
    padding: 0 1rem;
    max-width: 1600px;
  }

  .book-card {
    aspect-ratio: 2/3;
    width: 100%;
    margin: 0 auto;
  }

  @media (min-width: 1440px) {
    .book-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  @media (max-width: 1439px) and (min-width: 1024px) {
    .book-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 1023px) and (min-width: 768px) {
    .book-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 767px) {
    .book-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 0 0.5rem;
    }

    .book-title h2 {
      font-size: 1.25rem;
    }

    .book-title p {
      font-size: 0.875rem;
    }

    .book-icon {
      font-size: 2.5rem;
    }
  }

  .book-link {
    display: block;
    height: 100%;
    text-decoration: none;
  }

  .book {
    height: 100%;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    transition: transform 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .book:hover {
    transform: translateY(-5px);
  }

  .book-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .book-title {
    text-align: center;
  }

  .book-title h2 {
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .book-title p {
    font-size: 1rem;
    opacity: 0.9;
  }
</style>
