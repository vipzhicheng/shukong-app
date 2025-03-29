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
    <h1 class="text-3xl font-bold mb-8 dark:text-gray-300">选择字书</h1>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-8 mx-auto px-2 md:px-4 max-w-[1600px]">
      <div class="aspect-[2/3] w-full">
        <router-link to="/book/renjiao" class="block h-full">
          <div class="h-full bg-green-500 rounded-lg p-6 flex flex-col justify-center items-center text-white shadow-md hover:-translate-y-1 transition-transform duration-200">
            <i class="fas fa-book text-4xl md:text-5xl mb-4"></i>
            <div class="text-center">
              <h2 class="text-xl md:text-2xl font-bold mb-2">部编版语文</h2>
              <p class="text-sm md:text-base opacity-90">小学语文教材</p>
            </div>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>
