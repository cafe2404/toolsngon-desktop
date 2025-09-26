import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  onDeepLink: (callback: (url: string) => void) => {
    ipcRenderer.on("deep-link", (_, url) => callback(url))
  },
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url)
}
const authApi = {
  save: (access: string, refresh: string) => ipcRenderer.invoke("auth:save", { access, refresh }),
  get: () => ipcRenderer.invoke("auth:get"),
  clear: () => ipcRenderer.invoke("auth:clear")
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld("auth", authApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
