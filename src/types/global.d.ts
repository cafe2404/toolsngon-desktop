import { Cookie } from 'electron'

export {}

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

export type Device = {
  id: number
  user_agent?: string
  screen_resolution?: string
  language?: string
  timezone?: string
  platform?: string
  ip_address?: string
  location?: string
  hardware_concurrency?: number
  device_memory?: number
  first_seen?: string
  last_seen?: string
  is_active?: boolean
}

export type Extension = {
  id: number
  extension_id: string
  name: string
  zip_file: string
  created_at: string
  updated_at: string
}

export type Account = {
  id: number
  name: string
  cookies: Cookie[]
  local_storages: { key: string; value: string }[]
  script?: string
  css_text?: string
  device?: Device
  extensions?: Extension[]
  open_chrome?: boolean
  is_create_tab?: boolean
  is_edit_omnibox?: boolean
}

export type AccountGroup = {
  id: number
  name: string
  type: string
  accounts: Account[]
}
export type Product = {
  id: number
  title: string
  slug: string
  logo_url: string
  url: string
}
export type UserProduct = {
  id: number
  product: Product
  combo: { id: number; name: string } | null
  variant_duration: { id: number; label: string; type: string; value: number }
  account_group?: AccountGroup
  start_date: string
  end_date: string
  is_active: boolean
  remaining_days: number
  remaining_days_display: string
}
