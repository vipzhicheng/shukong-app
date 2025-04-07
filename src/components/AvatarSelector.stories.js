import { fn } from '@storybook/test'
import MyAvatarSelector from './AvatarSelector.vue'

export default {
  title: 'Components/AvatarSelector',
  component: MyAvatarSelector,
  tags: ['autodocs'],
  argTypes: {
    show: {
      control: 'boolean',
      description: '控制头像选择器的显示和隐藏'
    }
  },
  args: {
    'onUpdate:show': fn()
  }
}

export const Default = {
  args: {
    show: true
  }
}

export const Hidden = {
  args: {
    show: false
  }
}
