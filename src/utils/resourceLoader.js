export const loadResource = async filePath => {
  // 浏览器环境或开发环境
  if (process.env.NODE_ENV === 'development' || !window.electron) {
    const response = await fetch(`/${filePath}`)
    if (!response.ok) throw new Error('资源加载失败')
    return response.json()
  }

  // Electron生产环境
  try {
    return await window.electron.ipcRenderer.invoke('load-resource', filePath)
  } catch (error) {
    console.error('Electron资源加载失败:', error)
    throw error
  }
}
