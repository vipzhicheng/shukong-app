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
          example:
            '<StrokeOrderModal v-model:show="showModal" character="汉" />'
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
  <RightNav
    ><div class="nav-content">
      <div class="nav-menu">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200 p-4">
          组件库
        </h1>
      </div>
    </div></RightNav
  >
  <div class="ui-container">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <nav class="category-nav">
        <a
          v-for="category in components"
          :key="category.category"
          :href="`#${category.category}`"
          :class="[
            'category-link',
            { active: activeCategory === category.category }
          ]"
          @click.prevent="scrollToCategory(category.category)"
        >
          {{ category.category }}
        </a>
      </nav>
    </div>

    <!-- 右侧内容 -->
    <div class="content">
      <div
        v-for="category in components"
        :key="category.category"
        :id="category.category"
        class="category-section"
      >
        <h2 class="category-title">{{ category.category }}</h2>
        <div class="components-grid">
          <div
            v-for="item in category.items"
            :key="item.name"
            class="component-card"
          >
            <h3 class="component-name">{{ item.name }}</h3>
            <p class="component-description">{{ item.description }}</p>

            <!-- Props表格 -->
            <div v-if="item.props && item.props.length > 0" class="props-table">
              <h4 class="props-title">Props</h4>
              <table>
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>默认值</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="prop in item.props" :key="prop.name">
                    <td>{{ prop.name }}</td>
                    <td>{{ prop.type }}</td>
                    <td>{{ prop.default }}</td>
                    <td>{{ prop.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 示例代码 -->
            <div class="example-section">
              <h4 class="example-title">示例代码</h4>
              <pre class="example-code">{{ item.example }}</pre>
            </div>

            <!-- Switch组件演示 -->
            <div v-if="item.name === 'Switch'" class="demo-section">
              <h4 class="demo-title">组件演示</h4>
              <div class="demo-item">
                <label>默认大小：</label>
                <Switch v-model="switchDemo.default" />
              </div>
              <div class="demo-item">
                <label>小尺寸：</label>
                <Switch v-model="switchDemo.small" size="small" />
              </div>
              <div class="demo-item">
                <label>大尺寸：</label>
                <Switch v-model="switchDemo.large" size="large" />
              </div>
              <div class="demo-item">
                <label>自定义颜色：</label>
                <Switch
                  v-model="switchDemo.custom"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <div class="demo-item">
                <label>禁用状态：</label>
                <Switch v-model="switchDemo.disabled" disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
  .ui-container {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 240px;
    background-color: var(--bg-color-secondary);
    border-right: 1px solid var(--border-color);
    padding: 20px;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-color);
  }

  .category-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .category-link {
    padding: 10px;
    color: var(--text-color);
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .category-link:hover,
  .category-link.active {
    background-color: var(--primary-color);
    color: white;
  }

  .content {
    flex: 1;
    margin-left: 240px;
    padding: 20px;
  }

  .category-section {
    margin-bottom: 40px;
  }

  .category-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-color);
    padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-color);
  }

  .components-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .component-card {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
    width: 100%;
    margin-bottom: 20px;
  }

  .component-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .component-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--primary-color);
  }

  .component-description {
    color: var(--text-color);
    margin-bottom: 15px;
    line-height: 1.5;
  }

  .component-props {
    margin-bottom: 15px;
  }

  .component-props h4 {
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-color);
  }

  .component-props ul {
    list-style: disc;
    margin-left: 20px;
    color: var(--text-color);
  }

  .component-example {
    background-color: var(--bg-color-secondary);
    border-radius: 6px;
    padding: 15px;
    border: 1px solid var(--border-color);
  }

  .component-example h4 {
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-color);
  }

  .example-code {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 12px;
    background-color: var(--bg-color-secondary);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--text-color);
  }

  .props-table {
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }

  .props-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-color);
    padding: 1rem;
    background-color: var(--bg-color-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .example-section {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .example-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  .example-code {
    padding: 1rem;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--text-color);
  }

  .props-table th,
  .props-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
  }

  .props-table th {
    background-color: var(--bg-color-secondary);
    font-weight: 600;
  }

  .props-table tr:last-child td {
    border-bottom: none;
  }

  .props-table tr:hover {
    background-color: var(--hover-color);
  }

  .demo-section {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: var(--hover-color);
    border-radius: 0.5rem;
  }

  .demo-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  .demo-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .demo-item label {
    min-width: 100px;
    color: var(--text-color);
  }
</style>