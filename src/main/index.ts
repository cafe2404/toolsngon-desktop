/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  BrowserView,
  Menu,
  protocol,
  clipboard,
  dialog
} from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from './auth'
import { machineIdSync } from 'node-machine-id'
import { autoUpdater } from 'electron-updater'
import os from 'os'
import { prepareExtension } from './utils'
import { Account } from '../types/global'
import launchChrome from './openChrome'
import * as ChromeLauncher from 'chrome-launcher'
import fs from 'fs-extra' // hoặc 'fs' bình thường nhưng fs-extra tiện hơn
import https from 'https'
import http from 'http'
import { blockedUrlsManager } from './blockedUrls'

let mainWindow
let pendingDeepLink: string | null = null

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})
autoUpdater.checkForUpdatesAndNotify()

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
      mainWindow.webContents.send('deep-link', pendingDeepLink)
      pendingDeepLink = null
    }
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
    // Set app user model id for windows
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

        // Collect sessions (main window + all BrowserViews) BEFORE destroying views
        const sessions = new Set(Array.from(views.values()).map((v) => v.webContents.session))
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
      } catch {
        return false
      }
    })
    createWindow()

    // BrowserView manager - now profile-based
    const views = new Map<string, BrowserView>() // key: tabId, value: BrowserView
    const profileViews = new Map<string, Set<string>>() // key: profileId, value: Set<tabIds>
    const getView = (id: string): BrowserView | undefined => views.get(id)
    let activeView: BrowserView | null = null

    const computeBounds = (bounds: {
      x: number
      y: number
      width: number
      height: number
    }): Electron.Rectangle => bounds as Electron.Rectangle

    const attachView = async (
      id: string,
      url?: string,
      account?: Account,
      activate: boolean = true,
      profileId?: string
    ): Promise<BrowserView | undefined> => {
      let view = views.get(id)
      if (!view) {
        // Use profileId for partition if provided, otherwise fallback to tab id
        const partition = profileId ? `persist:profile-${profileId}` : `persist:profile-${id}`
        let additionalArguments
        if (account?.device) {
          const device = account?.device
          additionalArguments = [
            `--screenResolution=${device.screen_resolution}`,
            `--language=${device.language}`,
            `--timezone=${device.timezone}`,
            `--platform=${device.platform}`,
            `--hardwareConcurrency=${device.hardware_concurrency}`,
            `--deviceMemory=${device.device_memory}`
          ]
        } else {
          additionalArguments = null
        }
        view = new BrowserView({
          webPreferences: {
            sandbox: false,
            devTools: is.dev,
            partition,
            additionalArguments: additionalArguments,
            preload: join(__dirname, '../preload/device.js')
          }
        })
        views.set(id, view)

        // Track this tab in the profile
        if (profileId) {
          if (!profileViews.has(profileId)) {
            profileViews.set(profileId, new Set())
          }
          profileViews.get(profileId)!.add(id)
        }
        const session = view.webContents.session
        if (account?.device?.ip_address) {
          // Ví dụ: "http://gbpTxemouE:u0CxVMNM4aob777041@103.161.179.43:49697"
          const proxy = account.device.ip_address.trim()

          const match = proxy.match(/^(https?):\/\/(?:(.+?):(.+?)@)?(.+?):(\d+)$/)
          if (!match) {
            console.error('❌ Proxy format invalid:', proxy)
          } else {
            const [, protocol, username, password, host, port] = match

            // Set proxy
            await view.webContents.session.setProxy({
              proxyRules: `${protocol}://${host}:${port}`
            })

            // Handle auth nếu có user/pass
            if (username && password) {
              view.webContents.on('login', (event, _request, authInfo, callback) => {
                if (authInfo.isProxy) {
                  event.preventDefault()
                  callback(username, password)
                }
              })
            }
          }
        }
        if (account?.cookies) {
          await Promise.all(
            account?.cookies.map((c) => {
              const isHost = c.name.startsWith('__Host-')
              const isSecurePrefix = c.name.startsWith('__Secure-')
              const cookieObj: Electron.CookiesSetDetails = {
                url: `${c.secure || isHost || isSecurePrefix ? 'https' : 'http'}://${(c.domain ?? '').replace(/^\./, '')}${c.path || '/'}`,
                name: c.name,
                value: c.value,
                path: isHost ? '/' : c.path || '/',
                secure: isHost || isSecurePrefix ? true : c.secure || false,
                httpOnly: c.httpOnly || false,
                expirationDate: c.expirationDate
              }
              if (!isHost && c.domain) {
                cookieObj.domain = c.domain
              }
              session.cookies
                .set(cookieObj)
                .catch((err) => console.error('Set cookie fail', c.name, err))
            })
          )
        }
        if (account?.device?.user_agent) {
          await view.webContents.setUserAgent(account.device.user_agent)
        }
        if (account?.extensions) {
          for (const ext of account.extensions) {
            try {
              const extensionPath = await prepareExtension(ext.zip_file, ext.extension_id)
              console.log('extension', extensionPath)
              await view.webContents.session.extensions.loadExtension(extensionPath, {
                allowFileAccess: true
              })
            } catch (err) {
              console.error(`⚠️ Failed to load extension ${ext.name}:`, err)
            }
          }
        }
        console.log(view.webContents.session.extensions.getAllExtensions())
        view.webContents.setWindowOpenHandler(({ url }) => {
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
          if (account?.css_text) {
            view?.webContents.insertCSS(account?.css_text)
          }
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
        view.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
          console.log('Load failed:', errorCode, errorDescription)
        })
        const createMenuItem = (_, params) => {
          const menuItems = [
            {
              label: 'Sao chép văn bản',
              click: () => {
                if (params.selectionText) {
                  clipboard.writeText(params.selectionText)
                }
              }
            },
            {
              label: 'Sao chép hình ảnh',
              click: () => {
                if (params.srcURL) {
                  clipboard.writeImage(params.srcURL)
                }
              },
              visible: params.hasImageContents
            },
            {
              label: 'Tải xuống hình ảnh',
              click: async () => {
                if (params.srcURL) {
                  try {
                    const result = await dialog.showSaveDialog(mainWindow, {
                      defaultPath: `image-${Date.now()}.png`,
                      filters: [
                        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }
                      ]
                    })

                    if (!result.canceled && result.filePath) {
                      const protocol = params.srcURL.startsWith('https:') ? https : http
                      const file = fs.createWriteStream(result.filePath)

                      protocol
                        .get(params.srcURL, (response) => {
                          response.pipe(file)
                          file.on('finish', () => {
                            file.close()
                          })
                        })
                        .on('error', (err) => {
                          fs.unlink(result.filePath, () => {}) // Delete the file async
                          console.error('Download failed:', err)
                        })
                    }
                  } catch (error) {
                    console.error('Download error:', error)
                  }
                }
              },
              visible: params.hasImageContents
            },
            {
              label: 'Sao chép liên kết',
              click: () => {
                if (params.linkURL) {
                  clipboard.writeText(params.linkURL)
                }
              },
              visible: !!params.linkURL
            },
            {
              label: 'Mở liên kết trong trình duyệt',
              click: () => {
                if (params.linkURL) {
                  shell.openExternal(params.linkURL)
                }
              },
              visible: !!params.linkURL
            }
          ]
          if (is.dev) {
            menuItems.push({
              label: 'Toggle DevTools',
              click: () => {
                if (view!.webContents.isDevToolsOpened()) {
                  view!.webContents.closeDevTools()
                } else {
                  view!.webContents.openDevTools({ mode: 'detach' })
                }
              }
            })
          }
          return menuItems
        }
        view.webContents.on('context-menu', (_, params) => {
          const menu = Menu.buildFromTemplate(createMenuItem(_, params))
          menu.popup()
        })

        // URL blocking logic
        const shouldBlock = (url: string): boolean => {
          if (!url) return false
          const lower = url.toLowerCase()
          return blockedUrlsManager.blockedKeywords.some((keyword) =>
            lower.includes(keyword.toLowerCase())
          )
        }

        // Ensure blocked keywords are loaded
        await blockedUrlsManager.getBlockedKeywords()

        // Block requests
        view.webContents.session.webRequest.onBeforeRequest((details, callback) => {
          const { url } = details
          if (shouldBlock(url)) {
            console.log(`⛔ Blocked request: ${url}`)
            return callback({ cancel: true }) // chặn request
          }
          callback({}) // cho phép
        })

        // Block navigation
        view.webContents.on('will-navigate', (event, url) => {
          if (shouldBlock(url)) {
            console.log(`⛔ Blocked navigation: ${url}`)
            event.preventDefault()
          }
        })

        // Block redirects
        view.webContents.on('will-redirect', (event, url) => {
          if (shouldBlock(url)) {
            console.log(`⛔ Blocked redirect: ${url}`)
            event.preventDefault()
          }
        })
      }
      if (url) {
        // Load URL - blocking will be handled by webRequest handlers
        await view.webContents.loadURL(url)
        const screenResolution = account && account.device && account.device.screen_resolution
        if (screenResolution) {
          const [width, height] = screenResolution.split('x').map(Number)
          await view.webContents.enableDeviceEmulation({
            screenPosition: 'desktop', // hoặc 'desktop' tùy nhu cầu giả lập
            screenSize: { width, height },
            viewPosition: { x: 0, y: 0 },
            viewSize: { width, height },
            deviceScaleFactor: 1, // device pixel ratio, có thể điều chỉnh
            scale: 1 // zoom scale
          })
        }
        if (account?.local_storages) {
          const data = JSON.stringify(account.local_storages)
          await view?.webContents.executeJavaScript(`
            const lsData = ${data};
            for (const [key, value] of Object.entries(lsData)) {
              localStorage.setItem(key, value);
            }
          `)
        }
        await view.webContents.reload()
      }
      if (activate) {
        mainWindow?.setBrowserView(view)
        activeView = view
      }
      return view
    }

    ipcMain.handle('bv:attach', async (_e, { id, url, account, bounds, activate, profileId }) => {
      const view = await attachView(id, url, account, activate, profileId)
      if (view && bounds) {
        view.setBounds(computeBounds(bounds))
      }
      return true
    })

    ipcMain.handle('bv:open-chrome', async (_e, { id, url, account }) => {
      return await launchChrome({ id, url, account })
    })
    ipcMain.handle('bv:set-bounds', (_e, { id, bounds }) => {
      const v = getView(id)
      v?.setBounds(computeBounds(bounds))
      return true
    })
    ipcMain.handle('bv:focus', (_e, { id }) => {
      const v = getView(id)
      if (v) {
        mainWindow?.setBrowserView(v)
        activeView = v
      }
      return true
    })
    ipcMain.handle('bv:navigate', (_e, { id, url }) => {
      const v = getView(id)
      if (v && url) {
        v.webContents.loadURL(url)
      }
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
    ipcMain.handle('bv:destroy', (_e, { id, profileId }) => {
      const v = getView(id)
      if (v) {
        if (mainWindow?.getBrowserView() === v) {
          mainWindow.setBrowserView(null as unknown as BrowserView)
          if (activeView === v) activeView = null
        }
        views.delete(id)
        if (profileId && profileViews.has(profileId)) {
          profileViews.get(profileId)!.delete(id)
          if (profileViews.get(profileId)!.size === 0) {
            profileViews.delete(profileId)
          }
        }
        try {
          ;(v as unknown as { destroy?: () => void }).destroy?.()
        } catch {
          /* noop */
        }
      }
      return true
    })
    ipcMain.handle('bv:destroy-profile', (_e, { profileId }) => {
      const tabIds = profileViews.get(profileId)
      if (tabIds) {
        for (const tabId of tabIds) {
          const v = views.get(tabId)
          if (v) {
            try {
              if (mainWindow?.getBrowserView() === v)
                mainWindow.setBrowserView(null as unknown as BrowserView)
              if (activeView === v) activeView = null
            } catch {
              /* noop */
            }
            try {
              ;(v as unknown as { destroy?: () => void }).destroy?.()
            } catch {
              /* noop */
            }
            views.delete(tabId)
          }
        }
        profileViews.delete(profileId)
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
      profileViews.clear()
      return true
    })
    ipcMain.handle('bv:clear-profile-data', async (_e, { profileId }) => {
      try {
        // Clear sessions for all tabs in this profile
        const tabIds = profileViews.get(profileId)
        if (tabIds) {
          const sessions = new Set()
          for (const tabId of tabIds) {
            const view = views.get(tabId)
            if (view) {
              sessions.add(view.webContents.session)
            }
          }

          const clearTasks: Array<Promise<void>> = []
          for (const s of sessions) {
            clearTasks.push((s as Electron.Session).clearCache())
            clearTasks.push(
              (s as Electron.Session).clearStorageData({
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
        }
      } catch {
        /* noop */
      }
      return true
    })
    ipcMain.handle('bv:clear-all-data', async () => {
      try {
        await ChromeLauncher.killAll()
        const userDataDir = join(app.getPath('userData'), 'chrome-profile')
        if (fs.existsSync(userDataDir)) {
          await fs.remove(userDataDir)
        }
        const partitionDir = join(app.getPath('userData'), 'Partitions')
        if (fs.existsSync(partitionDir)) {
          await fs.remove(partitionDir)
        }
        const extensionsDir = join(app.getPath('userData'), 'extensions')
        if (fs.existsSync(extensionsDir)) {
          await fs.remove(extensionsDir)
        }
      } catch {
        /* noop */
      }
      return true
    })
    ipcMain.handle('bv:inject-script', async (_e, { id, script }) => {
      const v = getView(id)
      if (!v || !script) {
        return false
      }

      try {
        const session = v.webContents.session
        const fetch2fa = async (twoFactorAuth): Promise<string> => {
          const clean = twoFactorAuth.replace(/\s+/g, '')
          const url = `https://2fa.live/tok/${clean}`
          const res = await fetch(url)
          if (!res.ok) throw new Error(`2fa fetch failed ${res.status}`)
          const resJson = await res.json()
          return resJson.token
        }
        const parseCookies = (cookieString: string): Record<string, string> =>
          Object.fromEntries(
            cookieString.split(';').map((c) => {
              const [k, ...v] = c.trim().split('=')
              return [k, v.join('=')]
            })
          )
        const cookies = session.cookies
        const ctx = {
          webContents: v.webContents,
          session,
          cookies,
          URL,
          fetch2fa,
          parseCookies,
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
      } catch {
        /* noop */
        return false
      }
    })
    ipcMain.handle('os:get-device-uuid', async () => {
      const device_uuid = machineIdSync()
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

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await ChromeLauncher.killAll()
    app.quit()
  }
})
app.on('open-url', (event, url) => {
  event.preventDefault()
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('deep-link', url)
  } else {
    pendingDeepLink = url
  }
})
