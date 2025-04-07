import MyBackToTop from '../components/BackToTop.vue'

export default {
  title: 'Components/BackToTop',
  component: MyBackToTop,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '回到顶部按钮组件，当页面滚动超过一屏高度时显示。点击按钮可以平滑滚动回页面顶部。'
      }
    }
  }
}

export const Default = {
  render: () => ({
    components: { MyBackToTop },
    template: `
      <div style="height: 200vh; padding: 20px;">
        <p>向下滚动页面以查看回到顶部按钮</p>
        <my-back-to-top />
      </div>
    `
  })
}
