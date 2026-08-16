import { Cookie, ipcRenderer } from 'electron'
import { Account, UpdateInfo } from '../../types/global'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import { invoke, listen, listenEvent } from './ipc'

const channels = IPC_CHANNELS

export type Bounds = { x: number; y: number; width: number; height: number }

export type BrowserTabUpdate = {
  id: string
  updates: Record<string, unknown>
}

export type BrowserTabAttachResult = {
  ok: boolean
  webContentsId?: number
}

export type DetachedWindowClosedPayload = {
  id: string
  profileId?: string
}

export type NewTabPayload =
  | string
  | {
      id?: string
      url: string
      title?: string
      viewReady?: boolean
      webContentsId?: number
      forceCreate?: boolean
    }

export type SupportGuidePayload = {
  title: string
  description?: string
  contentMarkdown?: string
  guideUrl?: string
  productTitle?: string
  productLogoUrl?: string
}

export type UpdateProgress = {
  percent?: number
}

export type UpdateError = {
  message: string
}

const browserTabs = {
  attach: (
    id: string,
    url?: string,
    account?: Account,
    bounds?: Bounds,
    activate: boolean = true,
    profileId?: string
  ) =>
    ipcRenderer.invoke(channels.browser.tabs.attach, {
      id,
      url,
      account,
      bounds,
      activate,
      profileId
    }) as Promise<BrowserTabAttachResult>,
  openChrome: (id: string, url?: string, account?: Account) =>
    ipcRenderer.invoke(channels.browser.tabs.openChrome, { id, url, account }) as Promise<boolean>,
  setBounds: (id: string, bounds: Bounds) =>
    ipcRenderer.invoke(channels.browser.tabs.setBounds, { id, bounds }) as Promise<boolean>,
  focus: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.focus, { id }) as Promise<boolean>,
  navigate: (id: string, url: string) =>
    ipcRenderer.invoke(channels.browser.tabs.navigate, { id, url }) as Promise<boolean>,
  back: (id: string) => ipcRenderer.invoke(channels.browser.tabs.back, { id }) as Promise<boolean>,
  forward: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.forward, { id }) as Promise<boolean>,
  reload: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.reload, { id }) as Promise<boolean>,
  stop: (id: string) => ipcRenderer.invoke(channels.browser.tabs.stop, { id }) as Promise<boolean>,
  destroy: (id: string, profileId?: string) =>
    ipcRenderer.invoke(channels.browser.tabs.destroy, { id, profileId }) as Promise<boolean>,
  destroyAll: () => ipcRenderer.invoke(channels.browser.tabs.destroyAll) as Promise<boolean>,
  openWindow: (id: string, profileId?: string, title?: string) =>
    ipcRenderer.invoke(channels.browser.tabs.openWindow, {
      id,
      profileId,
      title
    }) as Promise<boolean>,
  closeWindow: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.closeWindow, { id }) as Promise<boolean>,
  injectScript: (id: string, script: string) =>
    ipcRenderer.invoke(channels.browser.tabs.injectScript, { id, script }) as Promise<boolean>,
  toggleFullscreen: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.toggleFullscreen, { id }) as Promise<boolean>,
  setCookies: (id: string, cookies: Cookie[]) =>
    ipcRenderer.invoke(channels.browser.tabs.setCookies, { id, cookies }) as Promise<boolean>,
  getCookies: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.getCookies, { id }) as Promise<Cookie[]>,
  captureScreenshot: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.captureScreenshot, { id }) as Promise<string | null>,
  getInfo: (id: string) => ipcRenderer.invoke(channels.browser.tabs.getInfo, { id }),
  getSessionStorage: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.getSessionStorage, { id }),
  getLocalStorage: (id: string) =>
    ipcRenderer.invoke(channels.browser.tabs.getLocalStorage, { id }),
  getIndexedDB: (id: string) => ipcRenderer.invoke(channels.browser.tabs.getIndexedDb, { id }),
  getWebSQL: (id: string) => ipcRenderer.invoke(channels.browser.tabs.getWebSql, { id }),
  getCache: (id: string) => ipcRenderer.invoke(channels.browser.tabs.getCache, { id }),
  onUpdated: (callback: (payload: BrowserTabUpdate) => void) =>
    listen(ipcRenderer, channels.browser.tabs.updated, callback),
  onDetachedWindowClosed: (callback: (payload: DetachedWindowClosedPayload) => void) =>
    listen(ipcRenderer, channels.browser.tabs.detachedWindowClosed, callback),
  onNewTab: (callback: (payload: NewTabPayload) => void) =>
    listen(ipcRenderer, channels.browser.tabs.newTab, callback)
}

const browserProfiles = {
  destroy: (profileId: string) =>
    ipcRenderer.invoke(channels.browser.profiles.destroy, { profileId }) as Promise<boolean>,
  clearData: (profileId: string) =>
    ipcRenderer.invoke(channels.browser.profiles.clearData, { profileId }) as Promise<boolean>
}

const browserExtensions = {
  togglePanel: (
    profileId: string,
    extension: NonNullable<Account['extensions']>[number],
    bounds?: Bounds
  ) =>
    ipcRenderer.invoke(channels.browser.extensions.togglePanel, {
      profileId,
      extension,
      bounds
    }) as Promise<{ opened: boolean; url?: string }>,
  closePanel: (profileId?: string, extensionId?: string) =>
    ipcRenderer.invoke(channels.browser.extensions.closePanel, {
      profileId,
      extensionId
    }) as Promise<boolean>
}

export const desktopApi = {
  events: {
    onDeepLink: (callback: (url: string) => void) =>
      listen(ipcRenderer, channels.app.deepLink, callback)
  },
  app: {
    openExternal: invoke<[string], void>(ipcRenderer, channels.app.openExternal, (url) => url),
    getDeviceUUID: () => ipcRenderer.invoke(channels.app.getDeviceUuid) as Promise<string>,
    getInfo: () =>
      ipcRenderer.invoke(channels.app.getInfo) as Promise<{
        device_name: string
        os: string
        app_version: string
      }>,
    supportGuide: {
      open: (payload: SupportGuidePayload) =>
        ipcRenderer.invoke(channels.supportGuide.open, payload) as Promise<boolean>,
      getPayload: () =>
        ipcRenderer.invoke(channels.supportGuide.getPayload) as Promise<SupportGuidePayload | null>,
      onPayloadUpdated: (callback: (payload: SupportGuidePayload | null) => void) =>
        listen(ipcRenderer, channels.supportGuide.payloadUpdated, callback)
    }
  },
  auth: {
    tokens: {
      save: (access: string, refresh: string) =>
        ipcRenderer.invoke(channels.auth.save, { access, refresh }) as Promise<boolean>,
      get: () =>
        ipcRenderer.invoke(channels.auth.get) as Promise<{
          access: string | null
          refresh: string | null
        }>,
      clear: () => ipcRenderer.invoke(channels.auth.clear) as Promise<boolean>
    }
  },
  browser: {
    tabs: browserTabs,
    profiles: browserProfiles,
    extensions: browserExtensions,
    storage: {
      clearAllData: () =>
        ipcRenderer.invoke(channels.browser.storage.clearAllData) as Promise<boolean>
    }
  },
  updates: {
    onChecking: (callback: () => void) =>
      listenEvent(ipcRenderer, channels.updates.checking, callback),
    onAvailable: (callback: (info: UpdateInfo) => void) =>
      listen(ipcRenderer, channels.updates.available, callback),
    onNotAvailable: (callback: (info: UpdateInfo) => void) =>
      listen(ipcRenderer, channels.updates.notAvailable, callback),
    onError: (callback: (error: UpdateError) => void) =>
      listen(ipcRenderer, channels.updates.error, callback),
    onProgress: (callback: (progress: UpdateProgress) => void) =>
      listen(ipcRenderer, channels.updates.progress, callback),
    onDownloaded: (callback: (info: UpdateInfo) => void) =>
      listen(ipcRenderer, channels.updates.downloaded, callback)
  }
}

export type DesktopApi = typeof desktopApi

export const legacyApi = {
  onDeepLink: desktopApi.events.onDeepLink,
  openExternal: desktopApi.app.openExternal,
  supportGuide: desktopApi.app.supportGuide,
  onBrowserViewUpdate: desktopApi.browser.tabs.onUpdated,
  browserView: {
    ...desktopApi.browser.tabs,
    toggleExtensionPanel: desktopApi.browser.extensions.togglePanel,
    closeExtensionPanel: desktopApi.browser.extensions.closePanel,
    destroyProfile: desktopApi.browser.profiles.destroy,
    clearProfileData: desktopApi.browser.profiles.clearData,
    clearAllData: desktopApi.browser.storage.clearAllData
  }
}

export const legacyAuthApi = desktopApi.auth.tokens

export const legacyOsApi = {
  getDeviceUUID: desktopApi.app.getDeviceUUID,
  getAppInfo: desktopApi.app.getInfo
}

export const legacyUpdateApi = {
  onUpdateChecking: desktopApi.updates.onChecking,
  onUpdateAvailable: desktopApi.updates.onAvailable,
  onUpdateNotAvailable: desktopApi.updates.onNotAvailable,
  onUpdateError: desktopApi.updates.onError,
  onUpdateProgress: desktopApi.updates.onProgress,
  onUpdateDownloaded: desktopApi.updates.onDownloaded
}
