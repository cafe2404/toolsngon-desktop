import { Account } from '../types/global'

declare global {
  interface Window {
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
          account?: Account,
          bounds?: { x: number; y: number; width: number; height: number },
          activate?: boolean,
          profileId?: string
        ) => Promise<boolean>
        openChrome: (id: string, url?: string, account?: Account) => Promise<boolean>
        setBounds: (
          id: string,
          bounds: { x: number; y: number; width: number; height: number }
        ) => Promise<boolean>
        focus: (id: string) => Promise<boolean>
        navigate: (id: string, url: string) => Promise<boolean>
        back: (id: string) => Promise<boolean>
        forward: (id: string) => Promise<boolean>
        reload: (id: string) => Promise<boolean>
        stop: (id: string) => Promise<boolean>
        destroyAll: () => Promise<boolean>
        destroyProfile: (profileId: string) => Promise<boolean>
        clearAllData: () => Promise<boolean>
        clearProfileData: (profileId: string) => Promise<boolean>
        destroy: (id: string, profileId?: string) => Promise<boolean>
        injectScript: (id: string, script: string) => Promise<boolean>
        onNewTab: (callback: (url: string) => void) => () => void
      }
    }
    auth: {
      save: (access: string, refresh: string) => Promise<boolean>
      get: () => Promise<{ access: string; refresh: string }>
      clear: () => Promise<boolean>
    }
    os: {
      getDeviceUUID: () => Promise<string>
      getAppInfo: () => Promise<{ device_name: string; os: string; app_version: string }>
    }
  }
}
