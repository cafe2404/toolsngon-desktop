import type {
  DesktopApi,
  legacyApi,
  legacyAuthApi,
  legacyOsApi,
  legacyUpdateApi
} from './bridge/desktop'

declare global {
  interface Window {
    electron: typeof import('@electron-toolkit/preload').electronAPI
    desktop: DesktopApi

    // Legacy aliases kept for older renderer code and gradual migrations.
    api: typeof legacyApi
    auth: typeof legacyAuthApi
    os: typeof legacyOsApi
    update: typeof legacyUpdateApi
  }
}

export {}
