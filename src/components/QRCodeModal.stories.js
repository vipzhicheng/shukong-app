import { fn } from '@storybook/test'
import MyQRCodeModal from '../components/QRCodeModal.vue'

export default {
  title: 'Components/QRCodeModal',
  component: MyQRCodeModal,
  tags: ['autodocs'],
  argTypes: {
    show: {
      control: 'boolean',
      description: '控制二维码模态框的显示和隐藏'
    },
    url: {
      control: 'text',
      description: '需要生成二维码的URL'
    }
  },
  args: {
    'onUpdate:show': fn()
  }
}

export const Default = {
  args: {
    show: true,
    url: 'https://example.com'
  }
}

export const Hidden = {
  args: {
    show: false,
    url: 'https://example.com'
  }
}

export const LongURL = {
  args: {
    show: true,
    url: 'https://example.com/very/long/url/with/multiple/parameters?param1=value1&param2=value2'
  }
}
