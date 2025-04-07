import MyRightNav from '../components/RightNav.vue'
import user from '../store/user'
/* import storybook-vue3-router */
import { vueRouter } from 'storybook-vue3-router'

export default {
  title: 'Components/RightNav',
  component: MyRightNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '顶部导航栏组件，包含搜索功能、用户头像等元素。'
      }
    }
  }
}

export const Default = {
  render: () => ({
    components: { MyRightNav },
    template: `
      <my-right-nav>
        <template #default>
          <span class="text-lg font-bold">书空</span>
        </template>
      </my-right-nav>
    `
  }),
  play: async () => {
    // 设置默认用户信息
    user.setNickname('测试用户')
    user.setAvatar('/avatars/01.png')
  }
}

/* adding storybook-vue3-router decorator */
Default.decorators = [
  /* this is the basic setup with no params passed to the decorator */
  vueRouter()
]

export const WithSlots = {
  render: () => ({
    components: { MyRightNav },
    template: `
      <my-right-nav>
        <template #default>
          <span class="text-lg font-bold">书空</span>
        </template>
        <template #right>
          <button class="px-4 py-2 bg-primary-500 text-white rounded-lg">自定义按钮</button>
        </template>
      </my-right-nav>
    `
  })
}
