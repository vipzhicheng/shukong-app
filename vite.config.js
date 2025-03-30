import { defineConfig, loadEnv } from 'vite'
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
            'avatars',
            'books',
            'icon.icns',
            'icon.ico',
            'icon.png',
            'icon.svg',
            'quiz.json'
          ].map(file => fs.copy(`public/${file}`, `dist/${file}`))
        )
        await fs.copy('README.md', 'dist/README.md')
        await fs.copy('screenshots', 'dist/screenshots')
        await fs.copy('HELP.md', 'dist/HELP.md')
        await fs.copy('LICENSE.txt', 'dist/LICENSE.txt')
      } else {
        // 手动复制需要的public文件，包含hanzi-writer目录
        await Promise.all(
          [
            'avatars',
            'books',
            'hanzi-writer',
            'icon.icns',
            'icon.ico',
            'icon.png',
            'icon.svg',
            'quiz.json'
          ].map(file => fs.copy(`public/${file}`, `dist_app/${file}`))
        )
        await fs.copy('README.md', 'dist_app/README.md')
        await fs.copy('screenshots', 'dist_app/screenshots')
        await fs.copy('HELP.md', 'dist_app/HELP.md')
        await fs.copy('LICENSE.txt', 'dist_app/LICENSE.txt')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = env.VITE_BASE_URL || '/'
  base =
    process.env.ELECTRON === 'true' || process.env.TAURI === 'true'
      ? './'
      : base
  return {
    plugins: [
      vue(),
      process.env.ELECTRON === 'true' &&
        electron({
          entry: 'electron/main.js'
        }),
      copyPublicFilesPlugin() // 添加自定义插件
    ].filter(Boolean),
    base,
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
        output: {
          manualChunks: {
            markmap: [
              'markmap-view',
              'markmap-lib',
              'markmap-common',
              'markmap-toolbar'
            ],
            markdown: [
              'markdown-it',
              'markdown-it-anchor',
              'markdown-it-ins',
              'markdown-it-mark',
              'markdown-it-sub',
              'markdown-it-sup',
              'markdown-it-toc-done-right'
            ]
          }
        },

        input: {
          main: 'index.html'
        }
      },
      assetsInclude: ['**/*.json'],
      // 在非Electron环境下，禁用public目录复制，手动控制需要复制的文件
      copyPublicDir: false
    }
  }
})
