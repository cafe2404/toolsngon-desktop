import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onDeepLink: (callback: (url: string) => void) => void,
      openExternal: (url: string) => void,
    },
    auth: {
      save: (access: string, refresh: string) => Promise<boolean>
      get: () => Promise<{ access: string | null; refresh: string | null }>
      clear: () => Promise<boolean>
    }
  }
}
