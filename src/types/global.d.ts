export {}

export type Account = {
  id: number
  name: string
  script?: string
  css_text?: string
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
