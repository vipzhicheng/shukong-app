import axios from 'axios'

const request = axios.create({
  baseURL: 'https://api.coze.cn/v1',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  config => {
    const cozeSettings = localStorage.getItem('cozeSettings')
    if (cozeSettings) {
      const { personalAccessToken } = JSON.parse(cozeSettings)
      if (personalAccessToken) {
        config.headers.Authorization = `Bearer ${personalAccessToken}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default request
