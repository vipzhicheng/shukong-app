<script setup>
import { ref, onMounted } from 'vue';
import { loadResource } from '../utils/resourceLoader';
import RightNav from '../components/RightNav.vue';

const books = ref([]);
const metadata = ref(null);

onMounted(async () => {
  try {
    const data = await loadResource('books/renjiao.json')
    metadata.value = data.metadata
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

    books.value = formattedBooks
  } catch (error) {
    console.error('Error loading books:', error)
  }
})
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <router-link to="/book" class="text-2xl font-bold no-underline text-inherit">{{ metadata?.name || '部编版语文' }}</router-link>
      </div>
    </div>
  </RightNav>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-8 mx-auto px-2 md:px-4 max-w-[1600px] mt-4">
      <div v-for="volume in books" :key="volume.grade + '-' + volume.term" class="aspect-[2/3] w-full">
        <router-link :to="`/book/renjiao/${volume.grade}${volume.volume}`" class="block h-full no-underline">
          <div class="h-full bg-green-500 rounded-lg p-6 flex flex-col justify-center items-center text-white transition-transform duration-200 hover:-translate-y-1 shadow-md">
            <i class="fas fa-book text-5xl mb-4 md:text-4xl"></i>
            <div class="text-center">
              <h2 class="text-xl font-bold mb-2 md:text-lg">{{ volume.term }}</h2>
              <p class="text-base opacity-90 md:text-sm">{{ metadata?.publisher || '部编版语文' }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>