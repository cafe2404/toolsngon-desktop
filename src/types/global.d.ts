export {}

export type UserProduct = {
  id: number
  product: { id: number; title: string; slug: string; logo_url: string; url: string }
  combo: { id: number; name: string } | null
  variant_duration: { id: number; label: string; type: string; value: number }
  account_group: { id: number; name: string; type: string } | null
  start_date: string
  end_date: string
  is_active: boolean
  remaining_days: number
  remaining_days_display: string
}
