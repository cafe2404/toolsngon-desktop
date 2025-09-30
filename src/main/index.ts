import { app, shell, BrowserWindow, ipcMain, BrowserView, session, Menu } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from './auth'

let mainWindow

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
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // hoặc 'hiddenInset' trên macOS
    titleBarOverlay: {
      color: '#00000000', // màu nền của overlay (navbar)
      symbolColor: '#1e293b', // màu icon minimize/maximize/close
      height: 40 // chiều cao vùng overlay
    },
    visualEffectState: 'active', // auto đổi 'inactive' khi mất focus
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    // mainWindow.maximize()  // mở app ở trạng thái maximize
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

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
    // Windows/Linux: deeplink nằm trong argv
    const url = argv.find((arg) => arg.startsWith('toolsngon://'))
    if (url && mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.webContents.send('deep-link', url)
    }
  })

  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.toolsngon')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('open-external', async (_, url) => {
      await shell.openExternal(url)
    })
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
      await clearTokens()
      return true
    })
    createWindow()

    // Load chromium extension path if present (used for per-tab sessions too)
    let extensionPath: string | null = null
    try {
      const fs = await import('fs')
      const devPath = path.resolve(
        __dirname,
        '../../resources/extension/clcfeejalfmjdkkmkcnmkggajcjhncad'
      )
      const prodPath = path.join(process.resourcesPath, 'extension', 'etsy')
      extensionPath = fs.existsSync(devPath) ? devPath : fs.existsSync(prodPath) ? prodPath : null
      if (extensionPath) {
        // Also load into defaultSession for any default use
        session.defaultSession.extensions
          .loadExtension(extensionPath, { allowFileAccess: true })
          .catch(() => {})
      }
    } catch {
      /* noop */
    }

    // BrowserView manager
    const views = new Map<string, BrowserView>()
    const getView = (id: string): BrowserView | undefined => views.get(id)
    let activeView: BrowserView | null = null

    const computeBounds = (bounds: {
      x: number
      y: number
      width: number
      height: number
    }): Electron.Rectangle => bounds as Electron.Rectangle

    const attachView = (
      id: string,
      url?: string,
      activate: boolean = true
    ): BrowserView | undefined => {
      let view = views.get(id)
      if (!view) {
        // Create an isolated persistent session for each tab id
        const partition = `persist:tab-${id}`
        view = new BrowserView({ webPreferences: { sandbox: false, partition } })
        views.set(id, view)
        
        // Set user agent for this session
        // const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        // view.webContents.setUserAgent(userAgent)
        if (extensionPath && url && url.includes('etsy')) {
          try {
            view.webContents.session.extensions
              .loadExtension(extensionPath, { allowFileAccess: true })
              .catch(() => {
                /* noop */
              })
          } catch {
            /* noop */
          }
        }
        view.webContents.setWindowOpenHandler(({ url }) => {
          // open in same view
          try {
            view?.webContents.loadURL(url)
          } catch {
            /* noop */
          }
          return { action: 'deny' }
        })
        const sendUpdate = (updates: Record<string, unknown>): void => {
          try {
            mainWindow?.webContents.send('bv:update', { id, updates })
          } catch {
            /* noop */
          }
        }
        view.webContents.on('did-start-loading', () => sendUpdate({ isLoading: true }))
        view.webContents.on('did-stop-loading', () => {
          sendUpdate({
            isLoading: false,
            canGoBack: view!.webContents.navigationHistory.canGoBack(),
            canGoForward: view!.webContents.navigationHistory.canGoForward(),
            currentUrl: view!.webContents.getURL()
          })
        })
        view.webContents.on('did-finish-load', () => {
          sendUpdate({
            isLoading: false,
            canGoBack: view!.webContents.navigationHistory.canGoBack(),
            canGoForward: view!.webContents.navigationHistory.canGoForward(),
            currentUrl: view!.webContents.getURL(),
            title: view!.webContents.getTitle()
          })
          // try favicon via DOM
          const pickBest = `(() => { const toAbs=(h)=>{try{return new URL(h, document.baseURI).href}catch{return h}}; const links=[...document.querySelectorAll("link[rel*='icon']")].map(el=>({href:toAbs(el.getAttribute('href')),sizes:(el.getAttribute('sizes')||'').toLowerCase(),type:(el.getAttribute('type')||'').toLowerCase(),rel:(el.getAttribute('rel')||'').toLowerCase()})).filter(x=>x.href); const sc=(c)=>{let s=0; if(c.type.includes('png'))s+=2; if(c.href.endsWith('.png'))s+=2; if(c.href.endsWith('.ico'))s+=1; if(c.rel.includes('shortcut'))s+=1; if(c.sizes.includes('64x64'))s+=3; if(c.sizes.includes('48x48'))s+=2; if(c.sizes.includes('32x32'))s+=2; if(c.sizes.includes('16x16'))s+=1; return s}; if(links.length){links.sort((a,b)=>sc(b)-sc(a)); return links[0].href;} const mf=document.querySelector("link[rel='manifest']"); if(mf){ const href=toAbs(mf.getAttribute('href')||''); return fetch(href).then(r=>r.json()).then(m=>{ const icons=Array.isArray(m.icons)?m.icons:[]; if(!icons.length) return null; const abs=icons.map(i=>({src:toAbs(i.src||i.url||''),sizes:(i.sizes||'').toLowerCase()})).filter(i=>i.src); abs.sort((a,b)=>{ const n=s=>{ const m=/([0-9]+)x([0-9]+)/.exec(s); return m?parseInt(m[1],10):0}; return n(b.sizes)-n(a.sizes)}); return abs[0]?.src||null;}).catch(()=>null);} try{return new URL('/favicon.ico', location.origin).href}catch{return null}})()`
          view!.webContents
            .executeJavaScript(pickBest)
            .then((icon: unknown) => {
              if (icon) sendUpdate({ favicon: icon })
            })
            .catch(() => {
              /* noop */
            })
        })
        view.webContents.on('page-title-updated', () =>
          sendUpdate({ title: view!.webContents.getTitle() })
        )
        view.webContents.on('did-navigate', (_, url) =>
          sendUpdate({
            currentUrl: url,
            canGoBack: view!.webContents.navigationHistory.canGoBack(),
            canGoForward: view!.webContents.navigationHistory.canGoForward()
          })
        )
        view.webContents.on('did-navigate-in-page', (_, url) =>
          sendUpdate({
            currentUrl: url,
            canGoBack: view!.webContents.navigationHistory.canGoBack(),
            canGoForward: view!.webContents.navigationHistory.canGoForward()
          })
        )
        view.webContents.on('context-menu', (_, params) => {
          const menu = Menu.buildFromTemplate([
            {
              label: 'Inspect Element',
              click: () => {
                view!.webContents.inspectElement(params.x, params.y)
              }
            },
            {
              label: 'Toggle DevTools',
              click: () => {
                if (view!.webContents.isDevToolsOpened()) {
                  view!.webContents.closeDevTools()
                } else {
                  view!.webContents.openDevTools({ mode: 'detach' })
                }
              }
            }
          ])
          menu.popup()
        })
      }
      if (url) {
        try {
          view.webContents.loadURL(url)
        } catch {
          /* noop */
        }
      }
      if (activate) {
        mainWindow?.setBrowserView(view)
        activeView = view
      }
      return view
    }

    ipcMain.handle('bv:attach', (_e, { id, url, bounds, activate }) => {
      const view = attachView(id, url, activate)
      if (view && bounds) {
        view.setBounds(computeBounds(bounds))
      }
      return true
    })
    ipcMain.handle('bv:set-bounds', (_e, { id, bounds }) => {
      const v = getView(id)
      v?.setBounds(computeBounds(bounds))
      return true
    })
    ipcMain.handle('bv:navigate', (_e, { id, url }) => {
      const v = getView(id)
      if (v && url) v.webContents.loadURL(url)
      return true
    })
    ipcMain.handle('bv:back', (_e, { id }) => {
      const v = getView(id)
      if (v?.webContents.navigationHistory.canGoBack()) v.webContents.navigationHistory.goBack()
      return true
    })
    ipcMain.handle('bv:forward', (_e, { id }) => {
      const v = getView(id)
      if (v?.webContents.navigationHistory.canGoForward()) v.webContents.goForward()
      return true
    })
    ipcMain.handle('bv:reload', (_e, { id }) => {
      const v = getView(id)
      v?.webContents.reload()
      return true
    })
    ipcMain.handle('bv:stop', (_e, { id }) => {
      const v = getView(id)
      v?.webContents.stop()
      return true
    })
    ipcMain.handle('bv:destroy', (_e, { id }) => {
      const v = getView(id)
      if (v) {
        if (mainWindow?.getBrowserView() === v) {
          mainWindow.setBrowserView(null as unknown as BrowserView)
          if (activeView === v) activeView = null
        }
        views.delete(id)
        try {
          ;(v as unknown as { destroy?: () => void }).destroy?.()
        } catch {
          /* noop */
        }
      }
      return true
    })
    ipcMain.handle('bv:destroy-all', () => {
      for (const v of views.values()) {
        try {
          if (mainWindow?.getBrowserView() === v)
            mainWindow.setBrowserView(null as unknown as BrowserView)
        } catch {
          /* noop */
        }
        try {
          ;(v as unknown as { destroy?: () => void }).destroy?.()
        } catch {
          /* noop */
        }
      }
      views.clear()
      return true
    })
    ipcMain.handle('bv:clear-data', async () => {
      try {
        const sessions = new Set(Array.from(views.values()).map((v) => v.webContents.session))
        if (mainWindow) sessions.add(mainWindow.webContents.session)
        const tasks: Array<Promise<void>> = []
        for (const s of sessions) {
          tasks.push(s.clearCache())
          tasks.push(
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
        await Promise.allSettled(tasks)
      } catch {
        /* noop */
      }
      return true
    })

    ipcMain.handle('bv:inject-script', async (_e, { id, script }) => {
      const v = getView(id)
      if (!v || !script) {
        console.log('bv:inject-script: No view or script')
        return false
      }

      try {
        const session = v.webContents.session

        // -------------------------
        // Helper functions trong scope main (sử dụng ctx)
        // -------------------------
        const fetch2fa = async (twoFactorAuth): Promise<string> => {
          const clean = twoFactorAuth.replace(/\s+/g, '')
          const url = `https://2fa.live/tok/${clean}`
          const res = await fetch(url)
          if (!res.ok) throw new Error(`2fa fetch failed ${res.status}`)
          const resJson: { token: string } = await res.json()
          return resJson.token
        }
        const cookies = session.cookies
        const ctx = {
          webContents: v.webContents,
          session,
          cookies,
          URL,
          fetch2fa,
          loadURL: (url: string) => {
            return v.webContents.loadURL(url)
          },
          dom: async (code) => {
            return v.webContents.executeJavaScript(`(async () => { ${code} })()`)
          }
        }
        const fn = new Function('ctx', `return (async () => { ${script} })()`)
        await fn(ctx)
        return true
      } catch (err) {
        console.error('bv:inject-script: ❌ Error executing script:', err)
        return false
      }
    })

    app.on('will-quit', () => {
      try {
        /* noop */
      } catch {
        /* noop */
      }
    })

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('open-url', (event, url) => {
  event.preventDefault()
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url)
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
