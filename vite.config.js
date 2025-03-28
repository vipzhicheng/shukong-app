import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import fs from 'fs-extra'

// 创建自定义插件来处理文件复制
function copyPublicFilesPlugin() {
  return {
    name: 'copy-public-files',
    closeBundle: async () => {
      if (process.env.ELECTRON !== 'true' && process.env.TAURI !== 'true') {
        // 手动复制需要的public文件，排除hanzi-writer目录
        await Promise.all(
          [
            'books',
            'icon.icns',
            'icon.ico',
            'icon.png',
            'icon.svg',
            'quiz.json'
          ].map(file => fs.copy(`public/${file}`, `dist/${file}`))
        )
      } else {
        // 手动复制需要的public文件，包含hanzi-writer目录
        await Promise.all(
          [
            'books',
            'hanzi-writer',
            'icon.icns',
            'icon.ico',
            'icon.png',
            'icon.svg',
            'quiz.json'
          ].map(file => fs.copy(`public/${file}`, `dist_app/${file}`))
        )
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    process.env.ELECTRON === 'true' &&
      electron({
        entry: 'electron/main.js'
      }),
    copyPublicFilesPlugin() // 添加自定义插件
  ].filter(Boolean),
  base:
    process.env.ELECTRON === 'true' || process.env.TAURI === 'true'
      ? './'
      : '/',
  server: {
    host: true, // 允许局域网访问
    port: 5175, // 默认端口
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ollama/, '')
      }
    }
  },
  build: {
    outDir:
      process.env.ELECTRON === 'true' || process.env.TAURI === 'true'
        ? 'dist_app'
        : 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    },
    assetsInclude: ['**/*.json'],
    // 在非Electron环境下，禁用public目录复制，手动控制需要复制的文件
    copyPublicDir: false
  }
})
