<script setup>
import { ref, onMounted, computed } from 'vue';
import { loadResource } from '../utils/resourceLoader'
import '@fortawesome/fontawesome-free/css/all.css'
import RightNav from '../components/RightNav.vue'

const books = ref([]);
const metadata = ref(null);
const selectedGrade = ref('all');
const selectedVolume = ref('all');
const grades = ref([]);
const volumes = ref([]);

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const gradeMatch = selectedGrade.value === 'all' || book.grade === parseInt(selectedGrade.value);
    const volumeMatch = selectedVolume.value === 'all' || book.volume === parseInt(selectedVolume.value);
    return gradeMatch && volumeMatch;
  });
});

onMounted(async () => {
  try {
    const data = await loadResource('books/jiujiu.json')
    metadata.value = data.metadata
    const formattedBooks = []
    const uniqueGrades = new Set()
    const uniqueVolumes = new Set()

    data.grades.forEach(grade => {
      uniqueGrades.add(grade.grade)
      grade.volumes.forEach(volume => {
        uniqueVolumes.add(volume.volume)
        formattedBooks.push({
          grade: grade.grade,
          term: volume.term,
          volume: volume.volume
        })
      })
    })

    books.value = formattedBooks
    grades.value = Array.from(uniqueGrades).sort((a, b) => a - b)
    volumes.value = Array.from(uniqueVolumes).sort((a, b) => a - b)
  } catch (error) {
    console.error('Error loading jiujiu books:', error)
  }
})
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <router-link to="/book" style="font-size: 1.5rem; font-weight: bold; text-decoration: none; color: inherit;">{{ metadata?.name || '久久积累' }}</router-link>
      </div>
    </div>
  </RightNav>
  <div class="container mx-auto px-4 py-8">
    <div class="flex gap-4 mb-6 mx-auto px-2 md:px-4 max-w-[1600px]">
      <div class="flex items-center gap-2">
        <label class="font-medium">年级：</label>
        <select v-model="selectedGrade" class="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">全部</option>
          <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}年级</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="font-medium">册别：</label>
        <select v-model="selectedVolume" class="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">全部</option>
          <option v-for="volume in volumes" :key="volume" :value="volume">第{{ volume }}册</option>
        </select>
      </div>
    </div>
    <div class="book-grid">
      <div v-for="volume in filteredBooks" :key="volume.grade + '-' + volume.term" class="book-card">
        <router-link :to="`/book/jiujiu/${volume.grade}${volume.volume}`" class="book-link">
          <div class="book">
            <i class="fas fa-book book-icon"></i>
            <div class="book-title">
              <h2>{{ volume.term }}</h2>
              <p>{{ metadata?.publisher || '久久积累' }}</p>
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
  background-color: #2196F3;
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
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.book-title p {
  font-size: 1rem;
  opacity: 0.9;
}
</style>
