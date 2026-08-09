import { BrowserWindow, ipcMain, shell, WebContentsView } from 'electron'

type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

type AuthLoginViewManager = {
  close(): void
}

const DESKTOP_AUTH_CALLBACK_ROUTE = '/api/appdesktop/auth'

const toBounds = (bounds: Bounds): Electron.Rectangle => bounds as Electron.Rectangle

export function registerAuthLoginView(mainWindow: BrowserWindow): AuthLoginViewManager {
  let loginView: WebContentsView | null = null

  const close = (): void => {
    if (!loginView) return
    try {
      mainWindow.contentView.removeChildView(loginView)
    } catch {
      /* noop */
    }
    try {
      if (!loginView.webContents.isDestroyed()) {
        loginView.webContents.close()
      }
    } catch {
      /* noop */
    }
    loginView = null
  }

  const emitCallbackIfMatched = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      const isDesktopAuthCallback =
        parsed.pathname.replace(/\/$/, '') === DESKTOP_AUTH_CALLBACK_ROUTE &&
        parsed.searchParams.has('token')

      if (!isDesktopAuthCallback) return false

      const callbackUrl = `toolsngon://auth${parsed.search}`
      mainWindow.webContents.send('deep-link', callbackUrl)
      close()
      return true
    } catch {
      return false
    }
  }

  const ensureView = (): WebContentsView => {
    if (loginView && !loginView.webContents.isDestroyed()) return loginView

    loginView = new WebContentsView({
      webPreferences: {
        sandbox: false,
        devTools: false
      }
    })

    loginView.webContents.setWindowOpenHandler((details) => {
      if (emitCallbackIfMatched(details.url)) return { action: 'deny' }

      try {
        loginView?.webContents.loadURL(details.url)
      } catch {
        void shell.openExternal(details.url)
      }
      return { action: 'deny' }
    })

    loginView.webContents.on('will-navigate', (event, url) => {
      if (emitCallbackIfMatched(url)) {
        event.preventDefault()
      }
    })

    loginView.webContents.on('will-redirect', (event, url) => {
      if (emitCallbackIfMatched(url)) {
        event.preventDefault()
      }
    })

    loginView.webContents.on('did-navigate', (_, url) => {
      emitCallbackIfMatched(url)
    })

    loginView.webContents.on('did-navigate-in-page', (_, url) => {
      emitCallbackIfMatched(url)
    })

    return loginView
  }

  ipcMain.handle(
    'auth-login-view:open',
    async (_event, { url, bounds }: { url: string; bounds: Bounds }) => {
      if (!url || !bounds) return false

      const view = ensureView()
      try {
        mainWindow.contentView.addChildView(view)
        view.setBounds(toBounds(bounds))
        await view.webContents.loadURL(url)
        return true
      } catch {
        return false
      }
    }
  )

  ipcMain.handle('auth-login-view:set-bounds', (_event, { bounds }: { bounds: Bounds }) => {
    if (!loginView || !bounds) return false
    try {
      loginView.setBounds(toBounds(bounds))
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('auth-login-view:close', () => {
    close()
    return true
  })

  return { close }
}
