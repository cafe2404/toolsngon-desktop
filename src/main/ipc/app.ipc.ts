/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import os from 'os'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
import {
  clearTokens,
  ensureDeviceID,
  getAccessToken,
  getRefreshToken,
  saveTokens
} from '../services/storage/auth'
import { clearSessionData } from '../browser/SessionManager'
import { WebContentsViewManager } from '../browser/BrowserManager'

type SupportGuidePayload = {
  title: string
  description?: string
  contentMarkdown?: string
  guideUrl?: string
  productTitle?: string
  productLogoUrl?: string
}

type RegisterAppIpcOptions = {
  mainWindow: BrowserWindow
  getBrowserManager(): WebContentsViewManager | null
}

function loadRendererRoute(window: BrowserWindow, route: string): void {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${route}`)
  } else {
    window.loadFile(join(__dirname, '../../renderer/index.html'), {
      hash: route.replace(/^\//, '')
    })
  }
}

export function registerAppIpc({
  mainWindow,
  getBrowserManager
}: RegisterAppIpcOptions): void {
  let supportGuidePayload: SupportGuidePayload | null = null
  let supportGuideWindow: BrowserWindow | null = null

  const openSupportGuideWindow = (payload: SupportGuidePayload): boolean => {
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
      title: payload.title || 'Huong dan ho tro',
      parent: mainWindow || undefined,
      modal: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      icon,
      webPreferences: {
        devTools: is.dev,
        preload: join(__dirname, '../../preload/index.js'),
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

      const sessions = new Set(getBrowserManager()?.getSessions() || [])
      if (mainWindow) sessions.add(mainWindow.webContents.session)

      await clearSessionData(sessions)
      getBrowserManager()?.destroyAll()

      return true
    } catch {
      return false
    }
  })

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
}
