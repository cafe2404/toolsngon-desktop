import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { injectBrowserAction } from 'electron-chrome-extensions/browser-action'
import {
  desktopApi,
  legacyApi,
  legacyAuthApi,
  legacyOsApi,
  legacyUpdateApi
} from './bridge/desktop'

injectBrowserAction()

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('desktop', desktopApi)

    // Backward-compatible aliases while renderer code is migrated.
    contextBridge.exposeInMainWorld('api', legacyApi)
    contextBridge.exposeInMainWorld('auth', legacyAuthApi)
    contextBridge.exposeInMainWorld('os', legacyOsApi)
    contextBridge.exposeInMainWorld('update', legacyUpdateApi)
  } catch (error) {
    console.error(error)
  }
} else {
  const target = window as typeof window & {
    electron: typeof electronAPI
    desktop: typeof desktopApi
    api: typeof legacyApi
    auth: typeof legacyAuthApi
    os: typeof legacyOsApi
    update: typeof legacyUpdateApi
  }

  target.electron = electronAPI
  target.desktop = desktopApi
  target.api = legacyApi
  target.auth = legacyAuthApi
  target.os = legacyOsApi
  target.update = legacyUpdateApi
}
