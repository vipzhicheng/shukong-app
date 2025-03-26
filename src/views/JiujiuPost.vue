<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import '@fortawesome/fontawesome-free/css/all.css'
  import RightNav from '../components/RightNav.vue'
  import { loadResource } from '../utils/resourceLoader'
  import StrokeOrderModal from '../components/StrokeOrderModal.vue'
  import { addToCart, countTotalCharacters } from '../store/cart'
  import { message } from '../utils/message'
  import { countChineseCharacters } from '../utils/common'
  import { fontFamily } from '../store/font'

  const route = useRoute()
  const router = useRouter()
  const postData = ref(null)
  const bookData = ref(null)
  const currentVolumeId = ref(null)
  const metadata = ref(null)

  const showModal = ref(false)
  const currentChar = ref('')

  const goBackPage = () => {
    // 从 URL 中获取文章类型
    const type = route.params.type
    // 根据文章类型构建返回链接
    const tab = type === 'exam' ? '考级篇目' : '必背篇目'
    router.push(
      `/book/jiujiu/${route.params.id}?tab=${encodeURIComponent(tab)}`
    )
  }

  // 播放汉字读音
  const handleTokenClick = token => {
    if (token.pinyin) {
      handleCharacterClick(token.char)
    }
  }

  const handleCharacterClick = char => {
    currentChar.value = char
    showModal.value = true
  }

  const loadPostData = async () => {
    try {
      const data = await loadResource('books/jiujiu.json')
      metadata.value = data.metadata
      const [gid, vid] = route.params.id.split('')
      currentVolumeId.value = route.params.id
      const type = route.params.type
      let cid = route.params.cid
      cid = cid - 1 >= 0 ? cid : 1
      const grade = data.grades.find(g => g.grade === parseInt(gid))
      if (grade) {
        // 处理 postData
        const volume = grade.volumes.find(g => g.volume === parseInt(vid))
        if (volume && type && volume[type]) {
          const post = volume[type][cid - 1]?.content
          if (post) {
            postData.value = post
          }
        }

        // 处理 bookData
        const content = {
          必背篇目: [],
          考级篇目: []
        }
        if (volume) {
          // 处理必背篇目内容
          if (volume?.required) {
            content['必背篇目'] = volume.required.map(article => ({
              title: article.title,
              subtitle: article.subtitle || '',
              author: article.author || '',
              content: article.content || ''
            }))
          }

          // 处理考级篇目内容
          if (volume?.exam) {
            content['考级篇目'] = volume.exam.map(article => ({
              title: article.title,
              subtitle: article.subtitle || '',
              author: article.author || '',
              content: article.content || ''
            }))
          }
        }

        // 将处理后的数据赋值给 bookData
        bookData.value = {
          ...grade,
          content
        }
      }
    } catch (error) {
      console.error('Error loading book data:', error)
    }
  }

  // 触摸事件相关变量
  const touchStartX = ref(0)
  const touchEndX = ref(0)
  const minSwipeDistance = 50 // 最小滑动距离

  // 处理触摸开始事件
  const handleTouchStart = event => {
    touchStartX.value = event.touches[0].clientX
  }

  // 处理触摸结束事件
  const handleTouchEnd = event => {
    touchEndX.value = event.changedTouches[0].clientX
    const swipeDistance = touchEndX.value - touchStartX.value

    if (Math.abs(swipeDistance) >= minSwipeDistance) {
      if (swipeDistance > 0 && route.params.cid > 1) {
        // 向右滑动，显示上一篇
        router.push(
          `/book/jiujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) - 1}`
        )
      } else if (
        swipeDistance < 0 &&
        bookData.value?.content[
          route.params.type === 'required' ? '必背篇目' : '考级篇目'
        ]?.length > parseInt(route.params.cid)
      ) {
        // 向左滑动，显示下一篇
        router.push(
          `/book/iujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) + 1}`
        )
      }
    }
  }

  // 处理键盘事件
  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft' && route.params.cid > 1) {
      // 左箭头，显示上一篇
      router.push(
        `/book/jiujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) - 1}`
      )
    } else if (
      event.key === 'ArrowRight' &&
      bookData.value?.content[
        route.params.type === 'required' ? '必背篇目' : '考级篇目'
      ]?.length > parseInt(route.params.cid)
    ) {
      router.push(
        `/book/jiujiu/${currentVolumeId.value}/${route.params.type}/${parseInt(route.params.cid) + 1}`
      )
    }
  }

  onMounted(() => {
    loadPostData()
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    // 移除键盘事件监听
    window.removeEventListener('keydown', handleKeyDown)
  })

  // 监听路由参数变化，重新加载文章数据
  watch(
    () => route.params,
    () => {
      loadPostData()
    },
    { deep: true }
  )

  const addToCartHandler = () => {
    if (!postData.value) return

    let count = 0
    for (let section of postData.value) {
      let text = ''
      for (let line of section.lines) {
        let lineText = ''
        for (let token of line.tokens) {
          if (/[\u4e00-\u9fa5]/.test(token.char)) {
            lineText += token.char
          }
        }
        text += lineText + '\n'
      }

      if (text) {
        if (countTotalCharacters() >= 1000) {
          message.error(
            `已添加 ${count} 字到书空笔顺练习，书空笔顺练习最多只能添加 1000 个字。`
          )
          return
        }
        if (addToCart(text)) {
          count += countChineseCharacters(text.replace('\n', ''))
        } else {
          continue
        }
      }
    }

    if (count > 0) {
      message.success(`已添加 ${count} 字到书空笔顺练习`)
    } else {
      message.error(`本次没有添加任何字，可能是之前已经添加过了。`)
    }
  }
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a
          @click="goBackPage"
          class="text-2xl font-bold cursor-pointer"
          >{{ metadata?.name }}
          {{ bookData?.volumes?.[0]?.term || '加载中...' }}</a
        >
      </div>
    </div>
  </RightNav>
  <div
    class="container px-4 py-8"
  >
    <!-- 导航区域 -->
    <div class="mb-4 flex items-center gap-4">
      <a href="" @click.prevent="goBackPage" class="flex items-center gap-2 no-underline dark:text-gray-300 text-gray-800 transition-colors duration-300 hover:text-primary-500">
        <i class="fas fa-arrow-left"></i>
        <span>返回目录</span>
      </a>

      <!-- 上一篇 -->
      <router-link
        :to="
          postData && route.params.cid > 1
            ? `/book/jiujiu/${currentVolumeId}/${route.params.type}/${parseInt(route.params.cid) - 1}`
            : ''
        "
        class="flex items-center gap-2 no-underline dark:text-gray-300 text-gray-800 transition-colors duration-300 hover:text-primary-500 ml-4"
        :class="{ 'cursor-not-allowed opacity-50 hover:text-gray-800': !postData || route.params.cid <= 1 }"
        @click.prevent="postData && route.params.cid > 1 ? null : false"
      >
        <i class="fas fa-chevron-left"></i>
        <span>上一篇</span>
      </router-link>

      <!-- 下一篇 -->
      <router-link
        :to="
          postData &&
          bookData?.content[
            route.params.type === 'required' ? '必背篇目' : '考级篇目'
          ]?.length > parseInt(route.params.cid)
            ? `/book/jiujiu/${currentVolumeId}/${route.params.type}/${parseInt(route.params.cid) + 1}`
            : ''
        "
        class="flex items-center gap-2 no-underline dark:text-gray-300 text-gray-800 transition-colors duration-300 hover:text-primary-500 ml-4"
        :class="{
          'cursor-not-allowed opacity-50 hover:text-gray-800':
            !postData ||
            !bookData?.content[
              route.params.type === 'required' ? '必背篇目' : '考级篇目'
            ]?.length ||
            bookData?.content[
              route.params.type === 'required' ? '必背篇目' : '考级篇目'
            ]?.length <= parseInt(route.params.cid)
        }"
        @click.prevent="
          postData &&
          bookData?.content[
            route.params.type === 'required' ? '必背篇目' : '考级篇目'
          ]?.length > parseInt(route.params.cid)
            ? null
            : false
        "
      >
        <span>下一篇</span>
        <i class="fas fa-chevron-right"></i>
      </router-link>
    </div>

    <!-- 内容区域 -->
    <div
      v-if="postData"
      class="flex flex-col gap-8"
      :style="
        { fontFamily: fontFamily }
      "
    >
      <div class="mb-8 p-8 dark:bg-gray-800 bg-gray-100 rounded-lg shadow border border-gray-300">
        <div class="text-lg leading-8 dark:text-gray-300  text-gray-800 whitespace-pre-wrap">
          <template
            v-for="(section, sectionIndex) in postData"
            :key="sectionIndex"
          >
            <!-- 标题渲染 -->
            <div v-if="section.type === 'title'" class="mb-6 text-center">
              <div
                v-for="(line, lineIndex) in section.lines"
                :key="lineIndex"
                class="flex flex-wrap justify-center"
              >
                <div
                  v-for="(token, tokenIndex) in line.tokens"
                  :key="tokenIndex"
                  class="flex flex-col items-center justify-center mx-0.5 p-0.5 box-border text-4xl xl:text-6xl font-bold cursor-pointer"
                  @click="handleTokenClick(token)"
                >
                  <div class="text-base">{{ token.pinyin || '　' }}</div>
                  <div>{{ token.char }}</div>
                </div>
                <div class="flex items-end justify-center">
                  <button
                    v-if="postData"
                    @click="addToCartHandler"
                    class="bg-transparent border-none text-gray-800 cursor-pointer p-2 text-lg transition-colors duration-300 hover:text-primary-500"
                    title="添加到书空笔顺练习"
                  >
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                </div>
              </div>
            </div>
            <!-- 副标题渲染 -->
            <div
              v-else-if="section.type === 'subtitle'"
              class="mb-4 text-center"
            >
              <div
                v-for="(line, lineIndex) in section.lines"
                :key="lineIndex"
                class="flex flex-wrap justify-center"
              >
                <div
                  v-for="(token, tokenIndex) in line.tokens"
                  :key="tokenIndex"
                  class="flex flex-col items-center justify-center mx-0.5 p-0.5 box-border text-3xl xl:text-4xl cursor-pointer"
                  @click="handleTokenClick(token)"
                >
                  <div class="text-base">{{ token.pinyin || '　' }}</div>
                  <div>{{ token.char }}</div>
                </div>
              </div>
            </div>
            <!-- 段落渲染 -->
            <div
              v-else
              class="my-16 flex flex-col"
              :class="{'items-start' : section.align === 'start', 'items-center' : section.align !=='start'}"
            >
              <div
                v-for="(line, lineIndex) in section.lines"
                :key="lineIndex"
                class="flex flex-wrap"
                :class="{ 'mb-6': section.break }"
              >
                <template v-if="lineIndex === 0 && section.indent">
                  <div
                    class="flex flex-col items-center justify-center mx-0.5 p-0.5 box-border cursor-pointer text-2xl xl:text-5xl ml-8"
                  >
                    <div class="text-xs xl:text-base">　</div>
                    <div>　</div>
                  </div>
                  <div
                    class="flex flex-col items-center justify-center mx-0.5 p-0.5 box-border cursor-pointer text-2xl xl:text-5xl ml-8"
                  >
                    <div class="text-xs xl:text-base">　</div>
                    <div>　</div>
                  </div>
                </template>
                <div
                  v-for="(token, tokenIndex) in line.tokens"
                  :key="tokenIndex"
                  class="flex flex-col items-center justify-center mx-0.5 p-0.5 box-border cursor-pointer text-2xl xl:text-5xl ml-8"
                  :class="{
                    'border-none box-border p-1': token.pinyin && token.pinyin.trim() !== ''
                  }"
                  @click="handleTokenClick(token)"
                >
                  <div class="text-xs xl:text-base">
                    {{ token.pinyin || '　' }}
                  </div>
                  <div>{{ token.char }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <StrokeOrderModal v-model:show="showModal" :character="currentChar" />
</template>
