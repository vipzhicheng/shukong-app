import { ref, watch } from 'vue'

const USER_STORAGE_KEY = 'shukong_user'

// 默认用户信息
const defaultUser = {
  nickname: '匿名用户',
  avatar: 'avatars/01.png'
}

// 从 localStorage 获取用户信息
const loadUserFromStorage = () => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  return storedUser ? JSON.parse(storedUser) : defaultUser
}

// 创建响应式用户信息
const user = ref(loadUserFromStorage())

// 监听用户信息变化，自动保存到 localStorage
watch(
  user,
  newValue => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newValue))
  },
  { deep: true }
)

// 导出用户信息相关方法
export default {
  user,
  // 获取用户昵称
  getNickname: () => user.value.nickname,

  // 获取用户头像
  getAvatar: () => {
    const baseUrl = import.meta.env.VITE_BASE_URL || '/'
    return baseUrl + user.value.avatar.replace(/^\//, '')
  },

  // 设置用户昵称
  setNickname: nickname => {
    user.value.nickname = nickname
  },

  // 设置用户头像
  setAvatar: avatar => {
    user.value.avatar = avatar
  },

  // 获取完整用户信息
  getUserInfo: () => user.value
}
