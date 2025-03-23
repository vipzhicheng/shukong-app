<script setup>
  import { ref, onMounted } from 'vue'
  import RightNav from '../components/RightNav.vue'
  import SideNav from '../components/SideNav.vue'
  import CartButton from '../components/CartButton.vue'
  import MessageDialog from '../components/MessageDialog.vue'
  import StrokeOrderModal from '../components/StrokeOrderModal.vue'
  import Switch from '../components/Switch.vue'

  const components = [
    {
      category: '导航组件',
      items: [
        {
          name: 'RightNav',
          component: RightNav,
          description: '右侧导航栏组件，用于页面顶部导航',
          props: [],
          example: '<RightNav>导航内容</RightNav>'
        },
        {
          name: 'SideNav',
          component: SideNav,
          description: '侧边导航栏组件，用于页面侧边导航',
          props: [],
          example: '<SideNav>侧边导航内容</SideNav>'
        }
      ]
    },
    {
      category: '表单组件',
      items: [
        {
          name: 'Switch',
          component: Switch,
          description: '开关切换组件，用于在两种状态间切换',
          props: [
            {
              name: 'modelValue',
              type: 'Boolean',
              default: 'false',
              description: '开关的状态值'
            },
            {
              name: 'size',
              type: 'String',
              default: '"default"',
              description: '开关大小，可选值：small、default、large'
            },
            {
              name: 'disabled',
              type: 'Boolean',
              default: 'false',
              description: '是否禁用'
            },
            {
              name: 'activeColor',
              type: 'String',
              default: '"#4caf50"',
              description: '打开时的背景色'
            },
            {
              name: 'inactiveColor',
              type: 'String',
              default: '"#dcdfe6"',
              description: '关闭时的背景色'
            }
          ],
          example: '<Switch v-model="value" />'
        }
      ]
    },
    {
      category: '功能组件',
      items: [
        {
          name: 'CartButton',
          component: CartButton,
          description: '购物车按钮组件',
          props: [],
          example: '<CartButton />'
        },
        {
          name: 'MessageDialog',
          component: MessageDialog,
          description: '消息对话框组件',
          props: [
            {
              name: 'message',
              type: 'String',
              default: '""',
              description: '要显示的消息内容'
            },
            {
              name: 'type',
              type: 'String',
              default: '"info"',
              description: '消息类型，可选值：info、success、warning、error'
            }
          ],
          example: '<MessageDialog message="提示信息" type="info" />'
        },
        {
          name: 'StrokeOrderModal',
          component: StrokeOrderModal,
          description: '笔顺展示模态框组件',
          props: [
            {
              name: 'show',
              type: 'Boolean',
              default: 'false',
              description: '控制模态框的显示状态'
            },
            {
              name: 'character',
              type: 'String',
              default: '""',
              description: '要展示笔顺的汉字'
            }
          ],
          example: '<StrokeOrderModal v-model:show="showModal" character="汉" />'
        }
      ]
    }
  ]

  const activeCategory = ref('')

  // Switch组件演示数据
  const switchDemo = ref({
    default: true,
    small: false,
    large: true,
    custom: true,
    disabled: false
  })

  onMounted(() => {
    // 如果URL中有锚点，滚动到对应位置
    if (window.location.hash) {
      const id = window.location.hash.slice(1)
      scrollToCategory(id)
    } else if (components.length > 0) {
      // 默认选中第一个分类
      activeCategory.value = components[0].category
    }
  })

  const scrollToCategory = category => {
    const element = document.getElementById(category)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      activeCategory.value = category
    }
  }
</script>

<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-300 p-4">
          组件库
        </h1>
      </div>
    </div>
  </RightNav>
  <div class="flex min-h-screen">
    <!-- 左侧导航 -->
    <div class="fixed w-60 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5">
      <nav class="flex flex-col space-y-2.5">
        <a
          v-for="category in components"
          :key="category.category"
          :href="`#${category.category}`"
          :class="[
            'px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white dark:hover:text-white transition-all duration-300',
            { 'bg-primary-500 text-white': activeCategory === category.category }
          ]"
          @click.prevent="scrollToCategory(category.category)"
        >
          {{ category.category }}
        </a>
      </nav>
    </div>

    <!-- 右侧内容 -->
    <div class="flex-1 ml-60 p-5">
      <div
        v-for="category in components"
        :key="category.category"
        :id="category.category"
        class="mb-10"
      >
        <h2 class="text-3xl font-semibold text-gray-800 dark:text-gray-300 mb-5 pb-2.5 border-b-2 border-primary-500">{{ category.category }}</h2>
        <div class="space-y-5">
          <div
            v-for="item in category.items"
            :key="item.name"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <h3 class="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-2.5">{{ item.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{{ item.description }}</p>

            <!-- Props表格 -->
            <div v-if="item.props && item.props.length > 0" class="mt-6 mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">Props</h4>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">名称</th>
                      <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">类型</th>
                      <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">默认值</th>
                      <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">说明</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="prop in item.props" :key="prop.name" class="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ prop.name }}</td>
                      <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ prop.type }}</td>
                      <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ prop.default }}</td>
                      <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ prop.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 示例代码 -->
            <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">示例代码</h4>
              <pre class="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">{{ item.example }}</pre>
            </div>

            <!-- Switch组件演示 -->
            <div v-if="item.name === 'Switch'" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">组件演示</h4>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <label class="min-w-[100px] text-gray-700 dark:text-gray-300">默认大小：</label>
                  <Switch v-model="switchDemo.default" />
                </div>
                <div class="flex items-center gap-4">
                  <label class="min-w-[100px] text-gray-700 dark:text-gray-300">小尺寸：</label>
                  <Switch v-model="switchDemo.small" size="small" />
                </div>
                <div class="flex items-center gap-4">
                  <label class="min-w-[100px] text-gray-700 dark:text-gray-300">大尺寸：</label>
                  <Switch v-model="switchDemo.large" size="large" />
                </div>
                <div class="flex items-center gap-4">
                  <label class="min-w-[100px] text-gray-700 dark:text-gray-300">自定义颜色：</label>
                  <Switch
                    v-model="switchDemo.custom"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                </div>
                <div class="flex items-center gap-4">
                  <label class="min-w-[100px] text-gray-700 dark:text-gray-300">禁用状态：</label>
                  <Switch v-model="switchDemo.disabled" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
