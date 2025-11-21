import { Account, Cookie, UpdateInfo } from '../types/global'

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
        toggleFullscreen: (id: string) => Promise<boolean>
        onNewTab: (callback: (url: string) => void) => () => void
        getCookies: (id: string) => Promise<Cookie[]>
        getInfo: (id: string) => Promise<{
          accountId?: number
          accountName?: string
          currentUrl: string
          proxy: {
            config: string
            ipAddress: string | null
            proxyString: string | null
          }
          device: {
            id: number
            user_agent?: string
            screen_resolution?: string
            language?: string
            timezone?: string
            platform?: string
            ip_address: string | null
            location?: string
            hardware_concurrency?: number
            device_memory?: number
            first_seen?: string
            last_seen?: string
            is_active?: boolean
          } | null
          fingerprint: Record<string, unknown> | null
          userAgent: string
          sessionId: string
        } | null>
        getSessionStorage: (id: string) => Promise<Record<string, string> | null>
        getLocalStorage: (id: string) => Promise<Record<string, string> | null>
        getIndexedDB: (id: string) => Promise<{
          available: boolean
          message?: string
          error?: string
        } | null>
        getWebSQL: (id: string) => Promise<{
          available: boolean
          message?: string
        } | null>
        getCache: (id: string) => Promise<{
          available: boolean
          caches?: Array<{
            name: string
            count: number
            urls: string[]
          }>
          message?: string
          error?: string
        } | null>
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
    update: {
      onUpdateChecking: (callback: () => void) => () => void
      onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void
      onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => () => void
      onUpdateError: (callback: (error: UpdateError) => void) => () => void
      onUpdateProgress: (callback: (progress: UpdateProgress) => void) => () => void
      onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void
    }
  }
}
