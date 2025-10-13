import { Cookie } from 'electron'

export {}

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
  external_urls?: { name: string; url: string }[]
  open_chrome?: boolean
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
