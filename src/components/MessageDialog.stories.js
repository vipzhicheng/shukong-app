import { fn } from '@storybook/test'
import MyMessageDialog from '../components/MessageDialog.vue'

export default {
  title: 'Components/MessageDialog',
  component: MyMessageDialog,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'warning', 'alert', 'confirm', 'error'],
      description: '对话框类型'
    },
    message: {
      control: 'text',
      description: '显示的消息内容'
    },
    visible: {
      control: 'boolean',
      description: '控制对话框的显示和隐藏'
    },
    closeOnClickOverlay: {
      control: 'boolean',
      description: '点击遮罩层时是否关闭对话框'
    },
    showCancelButton: {
      control: 'boolean',
      description: '是否显示取消按钮'
    }
  },
  args: {
    'onUpdate:visible': fn(),
    onOk: fn(),
    onCancel: fn(),
    onClose: fn()
  }
}

export const Success = {
  args: {
    type: 'success',
    message: '操作成功！',
    visible: true
  }
}

export const Warning = {
  args: {
    type: 'warning',
    message: '请注意，这是一个警告消息。',
    visible: true
  }
}

export const Confirm = {
  args: {
    type: 'confirm',
    message: '确定要执行此操作吗？',
    visible: true,
    showCancelButton: true
  }
}

export const Error = {
  args: {
    type: 'error',
    message: '操作失败，请重试。',
    visible: true
  }
}

export const Alert = {
  args: {
    type: 'alert',
    message: '这是一条提示信息。',
    visible: true
  }
}
