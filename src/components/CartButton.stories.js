import MyCartButton from '../components/CartButton.vue'
import { cartItems } from '../store/cart'
/* import storybook-vue3-router */
import { vueRouter } from 'storybook-vue3-router'

export default {
  title: 'Components/CartButton',
  component: MyCartButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '悬浮的笔顺练习按钮，显示当前选中的汉字数量。点击按钮可以跳转到练习页面。'
      }
    }
  },
  decorators: [
    () => ({
      template: '<div style="padding: 3em;"><story /></div>'
    })
  ]
}

export const Default = {
  render: () => ({
    components: { MyCartButton },
    template: '<my-cart-button />'
  }),
  play: async () => {
    // 清空购物车
    cartItems.value = []
  }
}

/* adding storybook-vue3-router decorator */
Default.decorators = [
  /* this is the basic setup with no params passed to the decorator */
  vueRouter()
]

export const WithItems = {
  render: () => ({
    components: { MyCartButton },
    template: '<my-cart-button />'
  }),
  play: async () => {
    // 添加一些汉字到购物车
    cartItems.value = ['你', '好', '世', '界']
  }
}

/* adding storybook-vue3-router decorator */
WithItems.decorators = [
  /* this is the basic setup with no params passed to the decorator */
  vueRouter()
]
