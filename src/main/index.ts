/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { app, shell, BrowserWindow, ipcMain, protocol, globalShortcut } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import icon from '../../resources/icon.png?asset'
import { saveTokens, getAccessToken, getRefreshToken, clearTokens, ensureDeviceID } from './auth'
import { autoUpdater } from 'electron-updater'
import os from 'os'
import * as ChromeLauncher from 'chrome-launcher'
import { registerWebContentsViewManager } from './webContentsViewManager'
import { registerAuthLoginView } from './authLoginView'

let mainWindow: BrowserWindow
let webContentsViewManager: ReturnType<typeof registerWebContentsViewManager> | null = null
let authLoginViewManager: ReturnType<typeof registerAuthLoginView> | null = null
let pendingDeepLink: string | null = null

type SupportGuidePayload = {
  title: string
  description?: string
  contentMarkdown?: string
  guideUrl?: string
  productTitle?: string
  productLogoUrl?: string
}

let supportGuidePayload: SupportGuidePayload | null = null
let supportGuideWindow: BrowserWindow | null = null

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

function loadRendererRoute(window: BrowserWindow, route: string): void {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${route}`)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'), { hash: route.replace(/^\//, '') })
  }
}

function openSupportGuideWindow(payload: SupportGuidePayload): boolean {
  supportGuidePayload = payload
  if (supportGuideWindow && !supportGuideWindow.isDestroyed()) {
    supportGuideWindow.focus()
    supportGuideWindow.webContents.send('support-guide:payload-updated', supportGuidePayload)
    return true
  }

  supportGuideWindow = new BrowserWindow({
    width: 1050,
    height: 780,
    minWidth: 560,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    title: payload.title || 'Hướng dẫn hỗ trợ',
    parent: mainWindow || undefined,
    modal: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon,
    webPreferences: {
      devTools: is.dev,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: false
    }
  })

  supportGuideWindow.on('ready-to-show', () => supportGuideWindow?.show())
  supportGuideWindow.on('closed', () => {
    supportGuideWindow = null
    supportGuidePayload = null
  })
  loadRendererRoute(supportGuideWindow, '/support-guide')
  return true
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
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('open-external', async (_, url) => {
      await shell.openExternal(url)
    })
    ipcMain.handle('support-guide:open', async (_, payload: SupportGuidePayload) => {
      return openSupportGuideWindow(payload)
    })
    ipcMain.handle('support-guide:get-payload', async () => supportGuidePayload)
    ipcMain.handle('auth:save', async (_, { access, refresh }) => {
      await saveTokens(access, refresh)
      return true
    })

    ipcMain.handle('auth:get', async () => {
      return {
        access: await getAccessToken(),
        refresh: await getRefreshToken()
      }
    })

    ipcMain.handle('auth:clear', async () => {
      try {
        await clearTokens()
        authLoginViewManager?.close()

        // Collect sessions (main window + all WebContentsViews) BEFORE destroying views
        const sessions = new Set(webContentsViewManager?.getSessions() || [])
        if (mainWindow) sessions.add(mainWindow.webContents.session)

        const clearTasks: Array<Promise<void>> = []
        for (const s of sessions) {
          clearTasks.push(s.clearCache())
          clearTasks.push(
            s.clearStorageData({
              storages: [
                'cookies',
                'filesystem',
                'indexdb',
                'localstorage',
                'shadercache',
                'serviceworkers',
                'cachestorage',
                'websql'
              ]
            })
          )
        }
        await Promise.allSettled(clearTasks)
        webContentsViewManager?.destroyAll()

        return true
      } catch {
        return false
      }
    })

    createWindow()
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
    // --- Auto update events ---
    autoUpdater.on('checking-for-update', () => {
      mainWindow?.webContents.send('update-checking')
    })

    autoUpdater.on('update-available', (info) => {
      mainWindow?.webContents.send('update-available', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      mainWindow?.webContents.send('update-not-available', info)
    })

    autoUpdater.on('error', (err) => {
      mainWindow?.webContents.send('update-error', { message: err.message })
    })

    autoUpdater.on('download-progress', (progressObj) => {
      mainWindow?.webContents.send('update-progress', progressObj)
    })

    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('update-downloaded', info)
      autoUpdater.quitAndInstall()
    })
    // --- Trigger check ---
    autoUpdater.checkForUpdatesAndNotify()
    webContentsViewManager = registerWebContentsViewManager(mainWindow)
    authLoginViewManager = registerAuthLoginView(mainWindow)
    ipcMain.handle('os:get-device-uuid', async () => {
      const device_uuid = await ensureDeviceID()
      return device_uuid
    })
    ipcMain.handle('os:get-app-info', async () => {
      return {
        device_name: os.hostname(),
        os: os.platform(),
        app_version: app.getVersion()
      }
    })

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
