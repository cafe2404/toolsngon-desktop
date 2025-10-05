import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  onDeepLink: (callback: (url: string) => void): (() => void) => {
    const listener = (_: Electron.IpcRendererEvent, url: string): void => callback(url)
    ipcRenderer.on('deep-link', listener)
    return () => ipcRenderer.removeListener('deep-link', listener)
  },
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onBrowserViewUpdate: (
    callback: (payload: { id: string; updates: Record<string, unknown> }) => void
  ): (() => void) => {
    const listener = (
      _e: Electron.IpcRendererEvent,
      payload: { id: string; updates: Record<string, unknown> }
    ): void => callback(payload)
    ipcRenderer.on('bv:update', listener)
    return () => ipcRenderer.removeListener('bv:update', listener)
  },
  browserView: {
    attach: (
      id: string,
      url?: string,
      bounds?: { x: number; y: number; width: number; height: number },
      activate: boolean = true
    ) => ipcRenderer.invoke('bv:attach', { id, url, bounds, activate }),
    setBounds: (id: string, bounds: { x: number; y: number; width: number; height: number }) =>
      ipcRenderer.invoke('bv:set-bounds', { id, bounds }),
    navigate: (id: string, url: string) => ipcRenderer.invoke('bv:navigate', { id, url }),
    back: (id: string) => ipcRenderer.invoke('bv:back', { id }),
    forward: (id: string) => ipcRenderer.invoke('bv:forward', { id }),
    reload: (id: string) => ipcRenderer.invoke('bv:reload', { id }),
    stop: (id: string) => ipcRenderer.invoke('bv:stop', { id }),
    destroyAll: () => ipcRenderer.invoke('bv:destroy-all'),
    clearData: () => ipcRenderer.invoke('bv:clear-data'),
    destroy: (id: string) => ipcRenderer.invoke('bv:destroy', { id }),

    injectScript: (id: string, script: string) =>
      ipcRenderer.invoke('bv:inject-script', { id, script })
  },
}

const authApi = {
  save: (access: string, refresh: string) => ipcRenderer.invoke('auth:save', { access, refresh }),
  get: () => ipcRenderer.invoke('auth:get'),
  clear: () => ipcRenderer.invoke('auth:clear'),
}

const osApi = {
  getDeviceUUID: () => ipcRenderer.invoke('os:get-device-uuid'),
  getAppInfo : () => ipcRenderer.invoke("os:get-app-info"),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('auth', authApi)
    contextBridge.exposeInMainWorld('os', osApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
