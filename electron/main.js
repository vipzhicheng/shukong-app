import { app, BrowserWindow, shell, Menu, dialog, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.name = "书空";
let isLoadResourceHandlerRegistered = false;
function createWindow() {
  if (!isLoadResourceHandlerRegistered) {
    ipcMain.handle("load-resource", async (_, filePath) => {
      const resourcePath = path.join(app.getAppPath(), "dist_app", filePath);
      const data = fs.readFileSync(resourcePath, "utf8");
      return JSON.parse(data);
    });
    isLoadResourceHandlerRegistered = true;
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 添加预加载脚本
      nodeIntegration: false, // 禁用nodeIntegration
      contextIsolation: true, // 启用上下文隔离
    },
  });

  // 配置新窗口的默认行为
  win.webContents.setWindowOpenHandler(({ url }) => {
    // 使用系统默认浏览器打开外部链接
    shell.openExternal(url);
    return { action: "deny" };
  });

  // 根据环境加载不同的URL
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile(path.join(__dirname, "../dist_app/index.html"));
    win.loadFile(path.join(__dirname, "../dist_app/index.html"));
  }

  return win;
}

const createMenu = (win) => {
  const template = [
    {
      label: "书空",
      submenu: [
        {
          label: "关于",
          click: () => {
            const options = {
              type: "info",
              title: "关于",
              message: "书空",
              detail: "v0.0.1",
            };
            dialog.showMessageBox(win, options);
          },
        },
        { type: "separator" },
        {
          label: "偏好设置",
          accelerator: process.platform === "darwin" ? "Cmd+," : "Ctrl+,",
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + "#/settings"
                : "file://" +
                    path.join(__dirname, "../dist_app/index.html#/settings")
            );
          },
        },
        { type: "separator" },
        { role: "quit", label: "退出" },
      ],
    },
    {
      label: "视图",
      submenu: [
        {
          label: "书空练习",
          accelerator: process.platform === "darwin" ? "Cmd+1" : "Ctrl+1",
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + "#/quiz"
                : "file://" +
                    path.join(__dirname, "../dist_app/index.html#/quiz")
            );
          },
        },
        {
          label: "查询笔顺",
          accelerator: process.platform === "darwin" ? "Cmd+2" : "Ctrl+2",
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + "#/"
                : "file://" +
                    path.join(__dirname, "../dist_app/index.html#/query")
            );
          },
        },
        {
          label: "教材列表",
          accelerator: process.platform === "darwin" ? "Cmd+3" : "Ctrl+3",
          click: () => {
            win.loadURL(
              process.env.VITE_DEV_SERVER_URL
                ? process.env.VITE_DEV_SERVER_URL + "#/book"
                : "file://" +
                    path.join(__dirname, "../dist_app/index.html#/book")
            );
          },
        },
        { type: "separator" },
        {
          role: "togglefullscreen",
          label: "切换全屏",
          accelerator: "Ctrl+Option+F",
        },
      ],
    },
    {
      label: "帮助",
      submenu: [
        { role: "toggleDevTools", label: "切换开发者工具" },
        { type: "separator" },
        {
          label: "帮助文档",
          click: () => {
            // TODO: 实现帮助文档功能
          },
        },
        {
          label: "意见反馈",
          click: () => {
            // TODO: 实现意见反馈功能
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

let mainWindow = null;

app.whenReady().then(() => {
  mainWindow = createWindow();
  createMenu(mainWindow);

  app.on("activate", () => {
    // 检查主窗口是否存在且未被销毁
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    } else {
      // 如果主窗口不存在或已被销毁，创建新窗口
      mainWindow = createWindow();
      createMenu(mainWindow);
    }
  });

  // 监听主窗口的关闭事件
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
