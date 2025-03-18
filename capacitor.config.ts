import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vipzhicheng.shukong',
  appName: '书空',
  webDir: 'dist_app',
  ios: {
    // 添加以下配置
    contentInset: 'automatic'
    // 或者使用
    // statusBarStyle: 'dark',
    // statusBarOverlaysWebView: false
  }
}

export default config
