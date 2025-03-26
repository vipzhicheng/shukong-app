import { app, BrowserWindow, shell, Menu, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 设置应用程序崩溃日志路径
process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error)
  const logPath = path.join(app.getPath('userData'), 'crash.log')
  fs.appendFileSync(
    logPath,
    `\n${new Date().toISOString()}\nError: ${error.stack}\n`
  )
  dialog.showErrorBox(
    '应用程序错误',
    '应用程序遇到了一个错误，请查看日志文件了解详情。\n' + error.message
  )
  if (process.platform === 'win32') {
    app.quit()
  }
})

process.on('unhandledRejection', reason => {
  console.error('未处理的 Promise 拒绝:', reason)
  const logPath = path.join(app.getPath('userData'), 'crash.log')
  fs.appendFileSync(
    logPath,
    `\n${new Date().toISOString()}\nUnhandled Rejection: ${reason}\n`
  )
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.name = '书空'

// 在 Windows 平台上实现单实例锁定
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

// 如果启动了第二个实例，则聚焦到第一个实例的窗口
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})

let isLoadResourceHandlerRegistered = false
function createWindow() {
  // 确保应用数据目录存在
  const userDataPath = app.getPath('userData')
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }
  if (!isLoadResourceHandlerRegistered) {
    ipcMain.handle('load-resource', async (_, filePath) => {
      const resourcePath = path.join(app.getAppPath(), 'dist_app', filePath)
      const data = fs.readFileSync(resourcePath, 'utf8')
      return JSON.parse(data)
    })
    isLoadResourceHandlerRegistered = true
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 添加预加载脚本
      nodeIntegration: false, // 禁用nodeIntegration
      contextIsolation: true // 启用上下文隔离
    }
  })

  // 等待页面加载完成后再显示窗口，避免白屏
  win.once('ready-to-show', () => {
    win.show()
  })

  // 监听渲染进程崩溃事件
  win.webContents.on('crashed', event => {
    const options = {
      type: 'error',
      title: '应用程序错误',
      message: '渲染进程崩溃',
      detail: '应用程序遇到了一个错误需要重新启动。',
      buttons: ['重新启动', '关闭'],
      noLink: true
    }

    dialog.showMessageBox(win, options).then(response => {
      if (response.response === 0) {
        app.relaunch()
        app.exit(0)
      } else {
        app.quit()
      }
    })
  })

  // 监听渲染进程无响应事件
  win.on('unresponsive', () => {
    const options = {
      type: 'warning',
      title: '应用程序无响应',
      message: '应用程序无响应',
      detail: '应用程序暂时无响应，是否等待？',
      buttons: ['等待', '重新启动'],
      noLink: true
    }

    dialog.showMessageBox(win, options).then(response => {
      if (response.response === 1) {
        app.relaunch()
        app.exit(0)
      }
    })
  })

  // 监听渲染进程恢复响应事件
  win.on('responsive', () => {
    // 可以在这里添加恢复响应后的处理逻辑
  })

  // 配置新窗口的默认行为
  win.webContents.setWindowOpenHandler(({ url }) => {
    // 使用系统默认浏览器打开外部链接
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 根据环境加载不同的URL
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile(path.join(__dirname, "../dist_app/index.html"));
    win.loadFile(path.join(__dirname, '../dist_app/index.html'))
  }

  return win
}

const createMenu = win => {
  const template = [
    {
      label: '书空',
      submenu: [
        {
          label: '关于',
          click: () => {
            const options = {
              type: 'info',
              title: '关于',
              message: '书空',
              detail: 'v0.0.1'
            }
            dialog.showMessageBox(win, options)
          }
        },
        { type: 'separator' },
        {
          label: '偏好设置',
          accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + '#/settings'
                : 'file://' +
                    path.join(__dirname, '../dist_app/index.html#/settings')
            )
          }
        },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '书空练习',
          accelerator: process.platform === 'darwin' ? 'Cmd+1' : 'Ctrl+1',
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + '#/quiz'
                : 'file://' +
                    path.join(__dirname, '../dist_app/index.html#/quiz')
            )
          }
        },
        {
          label: '查询笔顺',
          accelerator: process.platform === 'darwin' ? 'Cmd+2' : 'Ctrl+2',
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + '#/'
                : 'file://' +
                    path.join(__dirname, '../dist_app/index.html#/query')
            )
          }
        },
        {
          label: '教材列表',
          accelerator: process.platform === 'darwin' ? 'Cmd+3' : 'Ctrl+3',
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + '#/book'
                : 'file://' +
                    path.join(__dirname, '../dist_app/index.html#/book')
            )
          }
        },
        { type: 'separator' },
        {
          role: 'togglefullscreen',
          label: '切换全屏',
          accelerator: 'Ctrl+Option+F'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { type: 'separator' },
        {
          label: '帮助文档',
          click: () => {
            // TODO: 实现帮助文档功能
          }
        },
        {
          label: '意见反馈',
          click: () => {
            // TODO: 实现意见反馈功能
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

let mainWindow = null

app.whenReady().then(() => {
  mainWindow = createWindow()
  createMenu(mainWindow)

  app.on('activate', () => {
    // 检查主窗口是否存在且未被销毁
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
    } else {
      // 如果主窗口不存在或已被销毁，创建新窗口
      mainWindow = createWindow()
      createMenu(mainWindow)
    }
  })

  // 监听主窗口的关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
