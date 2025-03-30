<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../utils/request'
import { message } from '../utils/message'
import { Markmap } from 'markmap-view';
import { transformer } from '../utils/markmap';
import { Toolbar } from 'markmap-toolbar';
import RightNav from '../components/RightNav.vue'
import { useDictMapStore } from '../store/dictMap'
import { useDictmapHistoryStore } from '../store/dictmapHistory'


const route = useRoute()
const router = useRouter()
const dictMapStore = useDictMapStore()
const dictmapHistoryStore = useDictmapHistoryStore()
const inputText = ref(route.params.chars || '')
const loading = ref(false)
const svgRef = ref();
let mm;
const isFullscreen = ref(false)

const toggleFullscreen = async () => {
  const container = document.querySelector('#dict-markmap')
  if (!document.fullscreenElement) {
    await container.requestFullscreen()
    isFullscreen.value = true
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleKeydown = (event) => {
  if (event.code === 'Space' && !event.target.matches('input')) {
    event.preventDefault()
    mm?.fit()
  } else if (event.code === 'KeyF' && !event.target.matches('input')) {
    event.preventDefault()
    toggleFullscreen()
    setTimeout(() => {
      mm?.fit()
    }, 300)
  } else if (event.code === 'KeyZ' &&!event.target.matches('input')) {
    mm.rescale(1.25)
  } else if (event.code === 'KeyX' &&!event.target.matches('input')) {
    mm.rescale(0.8)
  }
}

onMounted(() => {
      mm = Markmap.create(svgRef.value, {
        maxWidth: 400,
      });

      // 监听路由参数变化
      watch(() => route.params.chars, (newChars) => {
        if (newChars) {
          inputText.value = decodeURIComponent(newChars)
          handleSubmit()
        }
      })

      // 初始化时检查是否有路由参数
      if (route.params.chars) {
        inputText.value = decodeURIComponent(route.params.chars)
        handleSubmit()
      }
      document.addEventListener('keydown', handleKeydown);
      const toolbar = new Toolbar()
      toolbar.register({
        id: 'fullscreen',
        title: '全屏',
        content: Toolbar.icon('M6 5.5C5.86739 5.5 5.74021 5.55268 5.64645 5.64645C5.55268 5.74021 5.5 5.86739 5.5 6V7.614C5.5 7.81291 5.42098 8.00368 5.28033 8.14433C5.13968 8.28498 4.94891 8.364 4.75 8.364C4.55109 8.364 4.36032 8.28498 4.21967 8.14433C4.07902 8.00368 4 7.81291 4 7.614V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H7.614C7.81291 4 8.00368 4.07902 8.14433 4.21967C8.28498 4.36032 8.364 4.55109 8.364 4.75C8.364 4.94891 8.28498 5.13968 8.14433 5.28033C8.00368 5.42098 7.81291 5.5 7.614 5.5H6ZM11.636 4.75C11.636 4.55109 11.715 4.36032 11.8557 4.21967C11.9963 4.07902 12.1871 4 12.386 4H14C14.5304 4 15.0391 4.21071 15.4142 4.58579C15.7893 4.96086 16 5.46957 16 6V7.614C16 7.81291 15.921 8.00368 15.7803 8.14433C15.6397 8.28498 15.4489 8.364 15.25 8.364C15.0511 8.364 14.8603 8.28498 14.7197 8.14433C14.579 8.00368 14.5 7.81291 14.5 7.614V6C14.5 5.86739 14.4473 5.74021 14.3536 5.64645C14.2598 5.55268 14.1326 5.5 14 5.5H12.386C12.1871 5.5 11.9963 5.42098 11.8557 5.28033C11.715 5.13968 11.636 4.94891 11.636 4.75ZM4.75 11.636C4.94891 11.636 5.13968 11.715 5.28033 11.8557C5.42098 11.9963 5.5 12.1871 5.5 12.386V14C5.5 14.1326 5.55268 14.2598 5.64645 14.3536C5.74021 14.4473 5.86739 14.5 6 14.5H7.614C7.81291 14.5 8.00368 14.579 8.14433 14.7197C8.28498 14.8603 8.364 15.0511 8.364 15.25C8.364 15.4489 8.28498 15.6397 8.14433 15.7803C8.00368 15.921 7.81291 16 7.614 16H6C5.46957 16 4.96086 15.7893 4.58579 15.4142C4.21071 15.0391 4 14.5304 4 14V12.386C4 12.1871 4.07902 11.9963 4.21967 11.8557C4.36032 11.715 4.55109 11.636 4.75 11.636ZM15.25 11.636C15.4489 11.636 15.6397 11.715 15.7803 11.8557C15.921 11.9963 16 12.1871 16 12.386V14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16H12.386C12.1871 16 11.9963 15.921 11.8557 15.7803C11.715 15.6397 11.636 15.4489 11.636 15.25C11.636 15.0511 11.715 14.8603 11.8557 14.7197C11.9963 14.579 12.1871 14.5 12.386 14.5H14C14.1326 14.5 14.2598 14.4473 14.3536 14.3536C14.4473 14.2598 14.5 14.1326 14.5 14V12.386C14.5 12.1871 14.579 11.9963 14.7197 11.8557C14.8603 11.715 15.0511 11.636 15.25 11.636Z'),
        onClick: toggleFullscreen
      })
      toolbar.setItems(['zoomIn', 'zoomOut', 'fit', 'fullscreen'])
      toolbar.setBrand(false)

      toolbar.attach(mm)
      const el = toolbar.render()
      el.style.position = 'absolute'
      el.style.bottom = '0.5rem'
      el.style.right = '0.5rem'
      el.style.display = 'flex'
      el.style.flexDirection = 'column'
      el.style.rowGap = '2px'
      document.getElementById('markmap-toolbar')?.append(el)

      // 监听全屏状态变化
      document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement
      })
    });

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

const handleSubmit = async () => {
  const text = inputText.value.trim()
  if (!text) return

  if (loading.value) return

  // 更新URL参数
  router.push(`/dictmap/${encodeURIComponent(text)}`)


  loading.value = true
  try {
    // 添加查询历史记录
    dictmapHistoryStore.addHistory(text)
    // 先从内存缓存中查找
    let data = dictMapStore.getFromMemory(text)
    if (!data) {
      // 如果内存中没有，则从 IndexDB 中查找
      data = await dictMapStore.getFromIndexDB(text)
    }

    if (data) {
      // 如果找到缓存数据，直接使用
      const { root } = transformer.transform(data)
      await mm.setData(root)
      mm.fit()
      return
    }

    // 如果没有缓存，则发起网络请求
    const response = await request.post('/workflow/run', {
      workflow_id: '7487193277452632102',
      app_id: '7487148162017673252',
      parameters: {
        input: text
      }
    })
    const parsedData = JSON.parse(response.data.data)
    if (parsedData) {
      const { root } = transformer.transform(parsedData.output);
      await mm.setData(root);
      mm.fit();
      // 将成功的响应数据保存到缓存
      await dictMapStore.saveToCache(text, parsedData.output)

    }

  } catch (error) {
    console.error('Coze API Error:', error)
    message.error('请求失败，请检查网络连接或 Token 是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold">导图字典</a>
      </div>
    </div>
  </RightNav>
  <div class="container mx-auto px-2 sm:px-4 py-4 flex flex-col w-full h-[60%]">
    <div class="w-full block md:flex">
      <div class="flex flex-col sm:flex-row gap-2 mb-4 mx-auto">
        <input
          type="text"
          v-model="inputText"
          class="w-full md:w-80 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="请输入要查询的内容"
          @keyup.enter="handleSubmit"
        />
        <div class="flex flex-wrap sm:flex-nowrap gap-2">
          <button
            @click="handleSubmit"
            :disabled="loading"
            class="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed h-12 md:h-full"
          >
            {{ loading ? '请求中...' : '查字典' }}
          </button>
          <button
            @click="() => router.push(`/query/${encodeURIComponent(inputText.trim())}`)"
            class="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 h-12 md:h-full"
          >
            查笔顺
          </button>
          <button
            @click="() => {
              message.confirm({
                title: '确认清空缓存',
                content: '确定要清空所有字典缓存数据吗？此操作不可撤销',
                onOk: async () => {
                  await dictMapStore.clearCache();
                  message.success('缓存已清空');
                }
              })
            }"
            class="flex-1 sm:flex-none px-2 py-2 text-red-500 rounded-lg hover:text-red-600 focus:outline-none dark:text-red-600 dark:hover:text-red-700"
 title="清空所有缓存"
          >
            <i class="fas fa-trash-alt"></i>
          </button>
          <button
            @click="async () => {
              if (!inputText || !inputText.trim()) return;
              await dictMapStore.removeFromCache(inputText.trim());
              message.success('已清除当前查询的缓存');
              handleSubmit();
            }"
            class="flex-1 sm:flex-none px-2 py-2 text-orange-500 rounded-lg hover:text-orange-600 focus:outline-none dark:text-orange-600 dark:hover:text-orange-700"
            title="刷新当前缓存"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>
    <div id="dict-markmap" class="flex-1 flex relative min-h-[300px] sm:min-h-[400px]">
      <svg class="flex-1 w-full bg-green-100" ref="svgRef" />
      <div id="markmap-toolbar" class="cursor-pointer dark:text-gray-50"></div>
    </div>
  </div>
  <div class="container mx-auto px-2 sm:px-4 py-4 max-w-4xl pb-20 sm:pb-40">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-bold text-gray-800 dark:text-gray-300">最近查询记录</h3>
      <button
        @click="() => {
          message.confirm({
            title: '确认清空历史',
            content: '确定要清空所有查询历史记录吗？此操作不可撤销',
            onOk: () => {
              dictmapHistoryStore.clearHistory();
              message.success('历史记录已清空');
            }
          })
        }"
        class="px-3 py-1 text-sm text-red-500 hover:text-red-700"
      >
        清空查询历史
      </button>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div v-if="dictmapHistoryStore.getHistory.length === 0" class="text-gray-500 text-center py-4">
        暂无查询记录
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <div
          v-for="(item, index) in dictmapHistoryStore.getHistory.slice(0, 20)"
          :key="index"
          @click="inputText = item.query; handleSubmit()"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-center text-gray-800 dark:text-gray-300 truncate"
        >
          {{ item.query }}
        </div>
      </div>
    </div>
  </div>
</template>