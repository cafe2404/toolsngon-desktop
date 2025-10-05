import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onDeepLink: (callback: (url: string) => void) => () => void
      openExternal: (url: string) => Promise<void>
      onBrowserViewUpdate: (
        callback: (payload: { id: string; updates: Record<string, unknown> }) => void
      ) => () => void
      browserView: {
        attach: (
          id: string,
          url?: string,
          bounds?: { x: number; y: number; width: number; height: number },
          activate?: boolean
        ) => Promise<boolean>
        setBounds: (
          id: string,
          bounds: { x: number; y: number; width: number; height: number }
        ) => Promise<boolean>
        navigate: (id: string, url: string) => Promise<boolean>
        back: (id: string) => Promise<boolean>
        forward: (id: string) => Promise<boolean>
        reload: (id: string) => Promise<boolean>
        stop: (id: string) => Promise<boolean>
        destroyAll: () => Promise<boolean>
        clearData: () => Promise<boolean>
        destroy: (id: string) => Promise<boolean>
        injectScript: (id: string, script: string) => Promise<boolean>
      }
    }
    auth: {
      save: (access: string, refresh: string) => Promise<boolean>
      get: () => Promise<{ access: string | null; refresh: string | null }>
      clear: () => Promise<boolean>
    }
    os: {
      getDeviceUUID: () => Promise<string>
      getAppInfo: () => Promise<{ device_name: string; os: string; app_version: string }>
    }
  }
}
