import { app, shell, BrowserWindow, protocol, globalShortcut, session } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ElectronChromeExtensions, setSessionPartitionResolver } from 'electron-chrome-extensions'
import icon from '../../resources/icon.png?asset'
import * as ChromeLauncher from 'chrome-launcher'
import { registerAppIpc } from './ipc/app.ipc'
import { registerAuthLoginView, registerWebContentsViewManager } from './ipc/browser.ipc'
import { registerAutoUpdater } from './services/update/autoUpdater'

let mainWindow: BrowserWindow
let webContentsViewManager: ReturnType<typeof registerWebContentsViewManager> | null = null
let authLoginViewManager: ReturnType<typeof registerAuthLoginView> | null = null
let pendingDeepLink: string | null = null

protocol.registerSchemesAsPrivileged([
  { scheme: 'chrome-extension', privileges: { secure: true, standard: true } }
])
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('toolsngon', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('toolsngon')
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 950,
    minWidth: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // hoặc 'hiddenInset' trên macOS
    titleBarOverlay: {
      color: '#00000000', // màu nền của overlay (navbar)
      symbolColor: '#1e293b', // màu icon minimize/maximize/close
      height: 44 // chiều cao vùng overlay
    },
    visualEffectState: 'active', // auto đổi 'inactive' khi mất focus
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      devTools: is.dev,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Xử lý pending deep-link nếu có
    if (pendingDeepLink) {
      authLoginViewManager?.close()
      mainWindow.webContents.send('deep-link', pendingDeepLink)
      pendingDeepLink = null
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ElectronChromeExtensions.handleCRXProtocol(mainWindow.webContents.session)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// đảm bảo chỉ chạy 1 instance
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    const url = argv.find((arg) => arg.startsWith('toolsngon://'))
    if (url) {
      if (mainWindow && mainWindow.webContents) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        mainWindow.webContents.send('deep-link', url)
      } else {
        // Lưu deep-link để xử lý sau khi mainWindow sẵn sàng
        pendingDeepLink = url
      }
    }
  })

  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.toolsngon')
    const startupUrl = process.argv.find((arg) => arg.startsWith('toolsngon://'))
    if (startupUrl && !pendingDeepLink) {
      pendingDeepLink = startupUrl
    }
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    setSessionPartitionResolver((partition) => session.fromPartition(partition))
    createWindow()
    registerAppIpc({
      mainWindow,
      getBrowserManager: () => webContentsViewManager,
      getAuthLoginViewManager: () => authLoginViewManager
    })
    try {
      // Global F11 toggles OS-level fullscreen for the main window
      globalShortcut.register('F11', () => {
        try {
          const target = !mainWindow.isFullScreen?.()
          mainWindow.setFullScreen(!!target)
        } catch {
          /* noop */
        }
      })
    } catch {
      /* noop */
    }
    registerAutoUpdater(mainWindow)
    webContentsViewManager = registerWebContentsViewManager(mainWindow)
    authLoginViewManager = registerAuthLoginView(mainWindow)
    app.on('will-quit', () => {
      try {
        globalShortcut.unregisterAll()
      } catch {
        /* noop */
      }
    })

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await ChromeLauncher.killAll()
    app.quit()
  }
})
app.on('open-url', (event, url) => {
  event.preventDefault()
  if (mainWindow && mainWindow.webContents) {
    authLoginViewManager?.close()
    mainWindow.webContents.send('deep-link', url)
  } else {
    pendingDeepLink = url
  }
})
