/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  app,
  BrowserWindow,
  clipboard,
  Cookie,
  dialog,
  ipcMain,
  Menu,
  shell,
  WebContentsView
} from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { ElectronChromeExtensions } from 'electron-chrome-extensions'
import * as ChromeLauncher from 'chrome-launcher'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { prepareExtension } from '../utils'
import { Account } from '../../types/global'
import launchChrome from '../services/automation/openChrome'
import { blockedUrlsManager } from '../services/storage/BlockedUrlsManager'
import { getExtensionPanelKey, resolveExtensionPanelUrl } from './ExtensionManager'
import { getGoogleFaviconUrl, sendAppProtocolUrl } from './NavigationManager'
import { addProfileTab, removeProfileTab } from './ProfileManager'
import {
  clearSessionData,
  getDeviceArguments,
  getProfilePartition,
  setCookiesForSession
} from './SessionManager'
import {
  computeBounds,
  computeFullscreenBounds,
  destroyWebContentsView,
  VIEW_TOP_OFFSET
} from './TabManager'

type ExtensionTabCreateDetails = {
  url?: string
  active?: boolean
}

export type WebContentsViewManager = {
  getSessions(): Electron.Session[]
  destroyAll(): void
}

export function registerWebContentsViewManager(mainWindow: BrowserWindow): WebContentsViewManager {
  // WebContentsView manager - now profile-based
  const views = new Map<string, WebContentsView>() // key: tabId, value: WebContentsView
  const attachedViews = new Set<WebContentsView>()
  const profileViews = new Map<string, Set<string>>() // key: profileId, value: Set<tabIds>
  const viewAccounts = new Map<string, Account>() // key: tabId, value: Account - store account data for later access
  const viewProfiles = new Map<string, string>() // key: tabId, value: profileId
  const getView = (id: string): WebContentsView | undefined => views.get(id)
  // Store previous bounds to support fullscreen toggle per WebContentsView
  const viewPreviousBounds = new Map<string, Electron.Rectangle>()
  let activeView: WebContentsView | null = null
  const detachedWindows = new Map<string, BrowserWindow>() // key: tabId, value: detached window
  const extensionPanelViews = new Map<string, WebContentsView>() // key: profileId:extensionId
  const extensionPaths = new Map<string, string>() // key: profileId:extensionId
  const extensionIdAliases = new Map<string, string>() // key: profileId:configuredExtensionId, value: loaded extension id
  const chromeExtensionManagers = new Map<string, ElectronChromeExtensions>() // key: profile partition
  const crxProtocolSessions = new WeakSet<Electron.Session>()

  const ensureExtensionProtocol = (electronSession: Electron.Session): void => {
    if (crxProtocolSessions.has(electronSession)) return

    try {
      ElectronChromeExtensions.handleCRXProtocol(electronSession)
      crxProtocolSessions.add(electronSession)
    } catch (err) {
      console.error('Failed to register extension protocol for session:', err)
    }
  }

  const handleAppProtocolUrl = (url?: string): boolean => {
    return sendAppProtocolUrl(mainWindow, url)
  }

  const isViewAttached = (view: WebContentsView): boolean => {
    try {
      return attachedViews.has(view)
    } catch {
      return false
    }
  }

  const addWebContentsView = (view: WebContentsView): void => {
    try {
      if (!isViewAttached(view)) {
        mainWindow.contentView.addChildView(view)
        attachedViews.add(view)
      } else {
        mainWindow.contentView.addChildView(view)
      }
    } catch {
      /* noop */
    }
  }

  const removeWebContentsView = (view: WebContentsView): void => {
    try {
      if (isViewAttached(view)) {
        mainWindow.contentView.removeChildView(view)
        attachedViews.delete(view)
      }
    } catch {
      /* noop */
    }
  }

  const closeExtensionPanel = (key?: string): void => {
    const entries = key
      ? Array.from(extensionPanelViews.entries()).filter(([panelKey]) => panelKey === key)
      : Array.from(extensionPanelViews.entries())

    for (const [panelKey, panelView] of entries) {
      removeWebContentsView(panelView)
      destroyWebContentsView(panelView)
      extensionPanelViews.delete(panelKey)
    }
  }

  const showActiveView = (view: WebContentsView): void => {
    if (Array.from(detachedWindows.keys()).some((id) => views.get(id) === view)) return
    if (activeView && activeView !== view) {
      closeExtensionPanel()
      removeWebContentsView(activeView)
    }
    addWebContentsView(view)
    activeView = view
    try {
      ElectronChromeExtensions.fromSession(view.webContents.session)?.selectTab(view.webContents)
    } catch {
      /* noop */
    }
  }

  const getDetachedViewBounds = (window: BrowserWindow): Electron.Rectangle => {
    const content = window.getContentBounds()
    return computeBounds({
      x: 0,
      y: 0,
      width: content.width,
      height: content.height
    })
  }

  const restoreDetachedTabToApp = (id: string, profileId?: string, notify = true): boolean => {
    const detachedWindow = detachedWindows.get(id)
    const view = getView(id)
    if (!detachedWindow || !view || view.webContents.isDestroyed()) return false

    detachedWindows.delete(id)
    try {
      detachedWindow.contentView.removeChildView(view)
    } catch {
      /* noop */
    }
    try {
      if (!detachedWindow.isDestroyed()) {
        detachedWindow.removeAllListeners('close')
        detachedWindow.close()
      }
    } catch {
      /* noop */
    }

    showActiveView(view)
    try {
      view.setBounds(computeFullscreenBounds(mainWindow))
    } catch {
      /* noop */
    }
    try {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    } catch {
      /* noop */
    }
    if (notify) {
      mainWindow.webContents.send('bv:detached-window-closed', { id, profileId })
    }
    return true
  }

  const closeDetachedWindowOnly = (id: string, view?: WebContentsView): void => {
    const detachedWindow = detachedWindows.get(id)
    if (!detachedWindow) return
    detachedWindows.delete(id)
    if (view) {
      try {
        detachedWindow.contentView.removeChildView(view)
      } catch {
        /* noop */
      }
    }
    try {
      if (!detachedWindow.isDestroyed()) {
        detachedWindow.removeAllListeners('close')
        detachedWindow.close()
      }
    } catch {
      /* noop */
    }
  }

  const openDetachedWindow = (id: string, profileId?: string, title?: string): boolean => {
    const view = getView(id)
    if (!view || view.webContents.isDestroyed()) return false

    const existingWindow = detachedWindows.get(id)
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus()
      return true
    }

    closeExtensionPanel()
    removeWebContentsView(view)
    if (activeView === view) activeView = null

    const detachedWindow = new BrowserWindow({
      width: 1280,
      height: 860,
      minWidth: 720,
      minHeight: 480,
      title: title || view.webContents.getTitle() || 'ToolsNgon',
      autoHideMenuBar: true,
      webPreferences: {
        sandbox: false
      }
    })

    detachedWindows.set(id, detachedWindow)
    detachedWindow.contentView.addChildView(view)
    view.setBounds(getDetachedViewBounds(detachedWindow))

    detachedWindow.on('resize', () => {
      try {
        view.setBounds(getDetachedViewBounds(detachedWindow))
      } catch {
        /* noop */
      }
    })
    detachedWindow.on('maximize', () => {
      try {
        view.setBounds(getDetachedViewBounds(detachedWindow))
      } catch {
        /* noop */
      }
    })
    detachedWindow.on('unmaximize', () => {
      try {
        view.setBounds(getDetachedViewBounds(detachedWindow))
      } catch {
        /* noop */
      }
    })
    detachedWindow.on('close', (event) => {
      if (!detachedWindows.has(id)) return
      event.preventDefault()
      restoreDetachedTabToApp(id, profileId)
    })

    detachedWindow.show()
    detachedWindow.focus()
    return true
  }

  const createFallbackExtensionTab = async (
    profileId: string | undefined,
    partition: string,
    details: ExtensionTabCreateDetails
  ): Promise<[Electron.WebContents, Electron.BrowserWindow]> => {
    const viewId = `extension_tab_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const view = new WebContentsView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        devTools: is.dev,
        partition,
        preload: join(__dirname, '../../preload/device.js')
      }
    })
    views.set(viewId, view)
    addProfileTab(profileViews, viewProfiles, profileId, viewId)
    try {
      const activeBounds = activeView?.getBounds()
      if (activeBounds) {
        view.setBounds(activeBounds)
      } else {
        const content = mainWindow.getContentBounds()
        view.setBounds(
          computeBounds({
            x: 0,
            y: VIEW_TOP_OFFSET,
            width: content.width,
            height: content.height - VIEW_TOP_OFFSET
          })
        )
      }
    } catch {
      /* noop */
    }
    if (details.url) {
      await view.webContents.loadURL(details.url)
    }
    if (details.active !== false) {
      mainWindow?.webContents.send('new-tab', {
        id: viewId,
        url: details.url || 'about:blank',
        title: view.webContents.getTitle() || 'Extension',
        viewReady: true,
        webContentsId: view.webContents.id,
        forceCreate: true
      })
    }
    return [view.webContents, mainWindow]
  }

  const getChromeExtensions = (
    profileId: string | undefined,
    electronSession: Electron.Session,
    partition: string
  ): ElectronChromeExtensions => {
    const key = profileId ? `profile-${profileId}` : partition
    const existing = chromeExtensionManagers.get(key)
    if (existing) return existing

    ensureExtensionProtocol(electronSession)

    const extensions = new ElectronChromeExtensions({
      license: 'GPL-3.0',
      session: electronSession,
      createTab: (details) => createFallbackExtensionTab(profileId, partition, details),
      selectTab: (tab) => {
        const view = Array.from(views.values()).find(
          (candidate) => candidate.webContents.id === tab.id
        )
        if (view) showActiveView(view)
      },
      removeTab: (tab) => {
        const entry = Array.from(views.entries()).find(([, view]) => view.webContents.id === tab.id)
        if (!entry) return
        const [id, view] = entry
        removeWebContentsView(view)
        if (activeView === view) activeView = null
        views.delete(id)
        viewAccounts.delete(id)
        viewProfiles.delete(id)
        destroyWebContentsView(view)
      },
      assignTabDetails: (details, tab) => {
        details.active = activeView?.webContents.id === tab.id
        details.highlighted = details.active
        details.selected = details.active
      },
      createWindow: async (details) => {
        if (details.url) {
          await createFallbackExtensionTab(profileId, partition, {
            url: Array.isArray(details.url) ? details.url[0] : details.url,
            active: true
          })
        }
        return mainWindow
      },
      removeWindow: () => {
        /* Keep the app window alive. */
      },
      requestPermissions: async () => true
    })
    extensions.on('browser-action-popup-created', (popup) => {
      try {
        popup.browserWindow?.setHasShadow(true)
      } catch {
        /* noop */
      }
    })
    chromeExtensionManagers.set(key, extensions)
    return extensions
  }

  const getViewIdByInstance = (view: WebContentsView | null): string | undefined => {
    if (!view) return undefined
    for (const [id, v] of views.entries()) {
      if (v === view) return id
    }
    return undefined
  }

  const loadAccountExtensions = async (
    electronSession: Electron.Session,
    ownerKey: string,
    account?: Account
  ): Promise<void> => {
    if (!account?.extensions) return

    for (const ext of account.extensions) {
      try {
        const extensionPath = await prepareExtension(ext.zip_file, ext.extension_id)
        const loadedExtensions = electronSession.extensions.getAllExtensions()
        const existingExtension = loadedExtensions.find(
          (loadedExtension) =>
            loadedExtension.id === ext.extension_id ||
            extensionPaths.get(`${ownerKey}:${loadedExtension.id}`) === extensionPath
        )
        const loadedExtension =
          existingExtension ||
          (await electronSession.extensions.loadExtension(extensionPath, {
            allowFileAccess: true
          }))
        const actualExtensionId = loadedExtension.id
        const configuredKey = `${ownerKey}:${ext.extension_id}`
        const actualKey = `${ownerKey}:${actualExtensionId}`

        extensionIdAliases.set(configuredKey, actualExtensionId)
        extensionPaths.set(configuredKey, extensionPath)
        extensionPaths.set(actualKey, extensionPath)
      } catch (err) {
        console.error(`⚠️ Failed to load extension ${ext.name}:`, err)
      }
    }
  }

  const attachView = async (
    id: string,
    url?: string,
    account?: Account,
    activate: boolean = true,
    profileId?: string
  ): Promise<WebContentsView | undefined> => {
    let view = views.get(id)
    if (!view) {
      // Use profileId for partition if provided, otherwise fallback to tab id
      const partition = getProfilePartition(profileId, id)
      const additionalArguments = getDeviceArguments(account)
      view = new WebContentsView({
        webPreferences: {
          sandbox: true,
          contextIsolation: true,
          devTools: is.dev,
          partition,
          additionalArguments,
          preload: join(__dirname, '../../preload/device.js')
        }
      })
      views.set(id, view)
      // Store account data for later access
      if (account) {
        viewAccounts.set(id, account)
      }
      // Track this tab in the profile
      addProfileTab(profileViews, viewProfiles, profileId, id)

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

      if (account?.device?.user_agent) {
        await view.webContents.setUserAgent(account.device.user_agent)
      }
      const session = view.webContents.session
      const chromeExtensions = getChromeExtensions(profileId, session, partition)
      if (session && account?.cookies) {
        await setCookiesForSession(session, account.cookies)
        console.log('Set cookies successfully')
      }
      await loadAccountExtensions(session, profileId || id, account)
      chromeExtensions.addTab(view.webContents, mainWindow)
      view.webContents.setWindowOpenHandler((details) => {
        try {
          if (handleAppProtocolUrl(details?.url)) {
            return { action: 'deny' }
          }
          // Open links that request a new window/tab (target=_blank, window.open) as a new tab
          // in the renderer (current profile context handles where to add it)
          if (details?.url) {
            mainWindow?.webContents.send('new-tab', details.url)
          }
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
        const favicon = getGoogleFaviconUrl(view!.webContents.getURL())
        if (favicon) sendUpdate({ favicon })
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
          favicon: getGoogleFaviconUrl(url),
          canGoBack: view!.webContents.navigationHistory.canGoBack(),
          canGoForward: view!.webContents.navigationHistory.canGoForward()
        })
      )
      view.webContents.on('did-navigate-in-page', (_, url) =>
        sendUpdate({
          currentUrl: url,
          favicon: getGoogleFaviconUrl(url),
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
                    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
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
            label: 'Mở liên kết trong tab mới',
            click: () => {
              if (params.linkURL) {
                mainWindow.webContents.send('new-tab', params.linkURL)
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
        const menu = Menu.buildFromTemplate([
          ...createMenuItem(_, params),
          ...chromeExtensions.getContextMenuItems(view!.webContents, params)
        ])
        menu.popup()
      })
      // console.log(view.webContents.session.extensions.getAllExtensions())
      await blockedUrlsManager.getBlockedKeywords()
      view.webContents.session.webRequest.onBeforeRequest((details, callback) => {
        const { url } = details
        if (blockedUrlsManager.isUrlBlocked(url)) {
          return callback({ cancel: true })
        }
        callback({})
      })
      view.webContents.on('will-navigate', (event, url) => {
        if (handleAppProtocolUrl(url)) {
          event.preventDefault()
          return
        }
        if (blockedUrlsManager.isUrlBlocked(url)) {
          event.preventDefault()
        }
      })
      view.webContents.on('will-redirect', (event, url) => {
        if (handleAppProtocolUrl(url)) {
          event.preventDefault()
          return
        }
        if (blockedUrlsManager.isUrlBlocked(url)) {
          event.preventDefault()
        }
      })
    }
    if (url) {
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
      showActiveView(view)
    }
    return view
  }

  ipcMain.handle('bv:attach', async (_e, { id, url, account, bounds, activate, profileId }) => {
    const view = await attachView(id, url, account, activate, profileId)
    if (view && bounds) {
      view.setBounds(computeBounds(bounds))
    }
    if (view) {
      const webContentsId = view.webContents.id
      mainWindow?.webContents.send('bv:update', {
        id,
        updates: { webContentsId }
      })
      return { ok: true, webContentsId }
    }
    return { ok: false }
  })
  ipcMain.handle('bv:toggle-extension-panel', async (_e, { profileId, extension, bounds }) => {
    if (!profileId || !extension?.extension_id) return { opened: false }

    const extensionId = extension.extension_id
    const panelKey = getExtensionPanelKey(profileId, extensionId)
    const actualExtensionId = extensionIdAliases.get(panelKey) || extensionId
    const actualPanelKey = getExtensionPanelKey(profileId, actualExtensionId)
    const existingPanel = extensionPanelViews.get(panelKey) || extensionPanelViews.get(actualPanelKey)
    if (existingPanel && isViewAttached(existingPanel)) {
      closeExtensionPanel(panelKey)
      if (actualPanelKey !== panelKey) closeExtensionPanel(actualPanelKey)
      return { opened: false }
    }

    closeExtensionPanel()

    const partition = getProfilePartition(profileId, profileId)
    let extensionPath = extensionPaths.get(panelKey) || extensionPaths.get(actualPanelKey)
    if (!extensionPath && extension.zip_file) {
      try {
        extensionPath = await prepareExtension(extension.zip_file, extensionId)
        extensionPaths.set(panelKey, extensionPath)
      } catch (err) {
        console.error(`Failed to prepare extension ${extensionId}:`, err)
      }
    }
    const panelUrl = await resolveExtensionPanelUrl(
      { ...extension, actual_extension_id: actualExtensionId },
      extensionPath
    )
    if (!panelUrl) return { opened: false }

    const panelView = new WebContentsView({
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        devTools: is.dev,
        partition
      }
    })
    ensureExtensionProtocol(panelView.webContents.session)
    if (extensionPath) {
      try {
        const loadedExtensions = panelView.webContents.session.extensions.getAllExtensions()
        const isLoaded = loadedExtensions.some(
          (loadedExtension) => loadedExtension.id === actualExtensionId
        )
        if (!isLoaded) {
          const loadedExtension = await panelView.webContents.session.extensions.loadExtension(
            extensionPath,
            { allowFileAccess: true }
          )
          extensionIdAliases.set(panelKey, loadedExtension.id)
          extensionPaths.set(getExtensionPanelKey(profileId, loadedExtension.id), extensionPath)
        }
      } catch (err) {
        console.error(`Failed to load panel extension ${extensionId}:`, err)
      }
    }
    panelView.webContents.setWindowOpenHandler((details) => {
      try {
        if (details?.url) mainWindow?.webContents.send('new-tab', details.url)
      } catch {
        /* noop */
      }
      return { action: 'deny' }
    })

    const content = mainWindow.getContentBounds()
    const panelWidth = Math.min(
      Math.max(Number(bounds?.width) || 380, 280),
      Math.max(content.width - 24, 280)
    )
    const panelHeight = Math.min(
      Math.max(Number(bounds?.height) || 520, 260),
      Math.max(content.height - VIEW_TOP_OFFSET - 16, 260)
    )
    const preferredX = Number(bounds?.x) || content.width - panelWidth - 12
    const preferredY = Number(bounds?.y) || VIEW_TOP_OFFSET + 8
    const x = Math.max(8, Math.min(preferredX, content.width - panelWidth - 8))
    const y = Math.max(VIEW_TOP_OFFSET + 4, Math.min(preferredY, content.height - panelHeight - 8))

    panelView.setBounds(computeBounds({ x, y, width: panelWidth, height: panelHeight }))
    addWebContentsView(panelView)
    extensionPanelViews.set(panelKey, panelView)
    extensionPanelViews.set(actualPanelKey, panelView)
    await panelView.webContents.loadURL(panelUrl)
    return { opened: true, url: panelUrl }
  })
  ipcMain.handle('bv:close-extension-panel', (_e, { profileId, extensionId }) => {
    closeExtensionPanel(profileId && extensionId ? `${profileId}:${extensionId}` : undefined)
    return true
  })
  ipcMain.handle(
    'bv:set-cookies',
    async (_e, { id, cookies }: { id: string; cookies: Cookie[] }) => {
      const v = getView(id)
      const session = v?.webContents.session
      if (session && cookies) {
        await setCookiesForSession(session, cookies)
        console.log('Set cookies successfully')
        v?.webContents.reload()
      } else {
        console.error('Set cookies failed')
        v?.webContents.reload()
      }
      return true
    }
  )
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
      showActiveView(v)
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
      closeDetachedWindowOnly(id, v)
      removeWebContentsView(v)
      ElectronChromeExtensions.fromSession(v.webContents.session)?.removeTab(v.webContents)
      if (activeView === v) activeView = null
      views.delete(id)
      viewAccounts.delete(id)
      viewProfiles.delete(id)
      if (profileId && profileViews.has(profileId)) {
        removeProfileTab(profileViews, profileId, id)
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
          closeDetachedWindowOnly(tabId, v)
          removeWebContentsView(v)
          ElectronChromeExtensions.fromSession(v.webContents.session)?.removeTab(v.webContents)
          if (activeView === v) activeView = null
          try {
            ;(v as unknown as { destroy?: () => void }).destroy?.()
          } catch {
            /* noop */
          }
          views.delete(tabId)
          viewAccounts.delete(tabId)
          viewProfiles.delete(tabId)
        }
      }
      profileViews.delete(profileId)
    }
    for (const panelKey of Array.from(extensionPanelViews.keys())) {
      if (panelKey.startsWith(`${profileId}:`)) closeExtensionPanel(panelKey)
    }
    for (const extensionKey of Array.from(extensionPaths.keys())) {
      if (extensionKey.startsWith(`${profileId}:`)) extensionPaths.delete(extensionKey)
    }
    return true
  })

  ipcMain.handle('bv:destroy-all', () => {
    for (const [id, v] of views.entries()) {
      closeDetachedWindowOnly(id, v)
      ElectronChromeExtensions.fromSession(v.webContents.session)?.removeTab(v.webContents)
      removeWebContentsView(v)
      try {
        ;(v as unknown as { destroy?: () => void }).destroy?.()
      } catch {
        /* noop */
      }
    }
    views.clear()
    profileViews.clear()
    viewAccounts.clear()
    viewProfiles.clear()
    closeExtensionPanel()
    extensionPaths.clear()
    return true
  })
  ipcMain.handle('bv:open-window', (_e, { id, profileId, title }) => {
    return openDetachedWindow(id, profileId, title)
  })
  ipcMain.handle('bv:close-window', (_e, { id }) => {
    const profileId = viewProfiles.get(id)
    return restoreDetachedTabToApp(id, profileId)
  })
  // Toggle fullscreen for a specific WebContentsView (fill window content area below overlay)
  ipcMain.handle('bv:toggle-fullscreen', (_e, { id }) => {
    const v = getView(id)
    if (!v) return false

    // Check if currently in fullscreen (has previous bounds stored)
    const isFullscreen = viewPreviousBounds.has(id)

    if (isFullscreen) {
      // Exit fullscreen: restore previous bounds
      const prev = viewPreviousBounds.get(id)
      if (prev) {
        try {
          v.setBounds(prev)
        } catch {
          /* noop */
        }
        viewPreviousBounds.delete(id)
      }
      try {
        if (mainWindow.isFullScreen?.()) mainWindow.setFullScreen(false)
      } catch {
        /* noop */
      }
    } else {
      // Enter fullscreen: save current bounds and set fullscreen
      try {
        viewPreviousBounds.set(id, v.getBounds())
      } catch {
        /* noop */
      }
      try {
        if (!mainWindow.isFullScreen?.()) mainWindow.setFullScreen(true)
      } catch {
        /* noop */
      }
      try {
        v.setBounds(computeFullscreenBounds(mainWindow))
      } catch {
        /* noop */
      }
      showActiveView(v)
    }
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

        await clearSessionData(sessions as Set<Electron.Session>)
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
        await fs.promises.rm(userDataDir, { recursive: true, force: true })
      }
      const partitionDir = join(app.getPath('userData'), 'Partitions')
      if (fs.existsSync(partitionDir)) {
        await fs.promises.rm(partitionDir, { recursive: true, force: true })
      }
      const extensionsDir = join(app.getPath('userData'), 'extensions')
      if (fs.existsSync(extensionsDir)) {
        await fs.promises.rm(extensionsDir, { recursive: true, force: true })
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
  ipcMain.handle('bv:get-cookies', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return []
    const cookies = await v.webContents.session.cookies.get({})
    return cookies
  })
  ipcMain.handle('bv:capture-screenshot', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null
    try {
      const image = await v.webContents.capturePage()
      return image.toDataURL()
    } catch {
      return null
    }
  })
  // Get view information including IP, device info, fingerprint, etc.
  ipcMain.handle('bv:get-info', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null

    const account = viewAccounts.get(id)
    const session = v.webContents.session
    const currentUrl = v.webContents.getURL()

    // Get proxy information
    const proxyConfig = await session.resolveProxy(currentUrl || 'https://www.google.com')

    // Extract IP from proxy if available
    let ipAddress = account?.device?.ip_address || null
    if (ipAddress) {
      // Extract IP from proxy string like "http://user:pass@host:port"
      const match = ipAddress.match(/(?:@|:\/\/)([^:]+)(?::\d+)?$/)
      if (match && match[1]) {
        ipAddress = match[1]
      }
    }

    // Get device information
    const deviceInfo = account?.device
      ? {
          id: account.device.id,
          user_agent: account.device.user_agent || v.webContents.getUserAgent(),
          screen_resolution: account.device.screen_resolution,
          language: account.device.language,
          timezone: account.device.timezone,
          platform: account.device.platform,
          ip_address: ipAddress,
          location: account.device.location,
          hardware_concurrency: account.device.hardware_concurrency,
          device_memory: account.device.device_memory,
          first_seen: account.device.first_seen,
          last_seen: account.device.last_seen,
          is_active: account.device.is_active
        }
      : null

    // Get fingerprint from WebContentsView (execute JavaScript to get browser fingerprint)
    let fingerprint = null
    try {
      if (
        currentUrl &&
        !currentUrl.startsWith('about:') &&
        !currentUrl.startsWith('toolsngon://')
      ) {
        fingerprint = await v.webContents
          .executeJavaScript(
            `
            (function() {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              ctx.textBaseline = 'top';
              ctx.font = '14px Arial';
              ctx.fillText('Browser fingerprint', 2, 2);
              const fingerprint = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages,
                platform: navigator.platform,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory,
                screenResolution: screen.width + 'x' + screen.height,
                screenColorDepth: screen.colorDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                canvasHash: canvas.toDataURL().substring(0, 100),
                webglVendor: (() => {
                  const gl = document.createElement('canvas').getContext('webgl');
                  return gl ? gl.getParameter(gl.getParameter(gl.VENDOR)) : null;
                })(),
                webglRenderer: (() => {
                  const gl = document.createElement('canvas').getContext('webgl');
                  return gl ? gl.getParameter(gl.getParameter(gl.RENDERER)) : null;
                })(),
                plugins: Array.from(navigator.plugins).map(p => p.name),
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                maxTouchPoints: navigator.maxTouchPoints || 0
              };
              return fingerprint;
            })()
          `
          )
          .catch(() => null)
      }
    } catch {
      /* noop */
    }

    return {
      accountId: account?.id,
      accountName: account?.name,
      currentUrl,
      proxy: {
        config: proxyConfig,
        ipAddress: ipAddress,
        proxyString: account?.device?.ip_address || null
      },
      device: deviceInfo,
      fingerprint,
      userAgent: v.webContents.getUserAgent(),
      sessionId: session.getUserAgent()
    }
  })
  // Get session storage
  ipcMain.handle('bv:get-session-storage', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null

    try {
      const currentUrl = v.webContents.getURL()
      if (!currentUrl || currentUrl.startsWith('about:') || currentUrl.startsWith('toolsngon://')) {
        return null
      }

      const sessionStorage = await v.webContents.executeJavaScript(`
          (function() {
            const data = {};
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              data[key] = sessionStorage.getItem(key);
            }
            return data;
          })()
        `)
      return sessionStorage
    } catch {
      return null
    }
  })
  // Get local storage
  ipcMain.handle('bv:get-local-storage', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null

    try {
      const currentUrl = v.webContents.getURL()
      if (!currentUrl || currentUrl.startsWith('about:') || currentUrl.startsWith('toolsngon://')) {
        return null
      }

      const localStorage = await v.webContents.executeJavaScript(`
          (function() {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              data[key] = localStorage.getItem(key);
            }
            return data;
          })()
        `)
      return localStorage
    } catch {
      return null
    }
  })
  // Get IndexedDB databases and their contents
  ipcMain.handle('bv:get-indexed-db', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null

    try {
      const currentUrl = v.webContents.getURL()
      if (!currentUrl || currentUrl.startsWith('about:') || currentUrl.startsWith('toolsngon://')) {
        return null
      }

      const indexedDBInfo = await v.webContents.executeJavaScript(`
          (async function() {
            if (!window.indexedDB) return null;
            const databases = [];
            try {
              // Try to get database list (this may not work in all browsers)
              const req = indexedDB.webkitGetDatabaseNames ? indexedDB.webkitGetDatabaseNames() : null;
              if (req) {
                await new Promise((resolve, reject) => {
                  req.onsuccess = () => resolve(req.result);
                  req.onerror = () => reject(req.error);
                });
                return {
                  available: true,
                  message: 'IndexedDB is available but listing databases may require manual inspection'
                };
              }
              return {
                available: true,
                message: 'IndexedDB is available'
              };
            } catch (e) {
              return {
                available: false,
                error: e.message
              };
            }
          })()
        `)
      return indexedDBInfo
    } catch {
      return null
    }
  })
  // Get Web SQL databases
  ipcMain.handle('bv:get-web-sql', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null

    try {
      const currentUrl = v.webContents.getURL()
      if (!currentUrl || currentUrl.startsWith('about:') || currentUrl.startsWith('toolsngon://')) {
        return null
      }

      const webSQLInfo = await v.webContents.executeJavaScript(`
          (function() {
            if (!window.openDatabase) {
              return {
                available: false,
                message: 'Web SQL is not available in this browser'
              };
            }
            return {
              available: true,
              message: 'Web SQL is available (deprecated API)'
            };
          })()
        `)
      return webSQLInfo
    } catch {
      return null
    }
  })
  // Get cache information
  ipcMain.handle('bv:get-cache', async (_e, { id }) => {
    const v = getView(id)
    if (!v) return null

    try {
      const currentUrl = v.webContents.getURL()
      if (!currentUrl || currentUrl.startsWith('about:') || currentUrl.startsWith('toolsngon://')) {
        return null
      }

      const cacheInfo = await v.webContents.executeJavaScript(`
          (async function() {
            if (!('caches' in window)) {
              return {
                available: false,
                message: 'Cache API is not available'
              };
            }
            try {
              const cacheNames = await caches.keys();
              const cacheDetails = [];
              for (const name of cacheNames) {
                const cache = await caches.open(name);
                const keys = await cache.keys();
                cacheDetails.push({
                  name: name,
                  count: keys.length,
                  urls: keys.slice(0, 10).map(req => req.url) // Limit to first 10 URLs
                });
              }
              return {
                available: true,
                caches: cacheDetails
              };
            } catch (e) {
              return {
                available: true,
                error: e.message
              };
            }
          })()
        `)
      return cacheInfo
    } catch {
      return null
    }
  })

  try {
    mainWindow.on('resize', () => {
      for (const [id] of viewPreviousBounds) {
        const v = getView(id)
        if (v) {
          try {
            v.setBounds(computeFullscreenBounds(mainWindow))
          } catch {
            /* noop */
          }
        }
      }
    })
    mainWindow.on('enter-full-screen', () => {
      const id = getViewIdByInstance(activeView)
      if (id && activeView) {
        if (!viewPreviousBounds.has(id)) {
          try {
            viewPreviousBounds.set(id, activeView.getBounds())
          } catch {
            /* noop */
          }
        }
        try {
          activeView.setBounds(computeFullscreenBounds(mainWindow))
        } catch {
          /* noop */
        }
      }
    })
    mainWindow.on('leave-full-screen', () => {
      for (const [id, prev] of viewPreviousBounds.entries()) {
        const v = getView(id)
        if (v && prev) {
          try {
            v.setBounds(prev)
          } catch {
            /* noop */
          }
        }
        viewPreviousBounds.delete(id)
      }
    })
  } catch {
    /* noop */
  }

  return {
    getSessions(): Electron.Session[] {
      return Array.from(new Set(Array.from(views.values()).map((view) => view.webContents.session)))
    },
    destroyAll(): void {
      for (const v of views.values()) {
        try {
          ElectronChromeExtensions.fromSession(v.webContents.session)?.removeTab(v.webContents)
          removeWebContentsView(v)
        } catch {
          /* noop */
        }
        destroyWebContentsView(v)
      }
      views.clear()
      profileViews.clear()
      viewAccounts.clear()
      viewProfiles.clear()
      closeExtensionPanel()
      extensionPaths.clear()
    }
  }
}
