import api from './axios'
import { SERVER_URL } from './server'

const SERVER_ORIGIN = new URL(SERVER_URL).origin

const isServerUrl = (url?: string): boolean => {
  if (!url) return false
  try {
    return new URL(url, SERVER_URL).origin === SERVER_ORIGIN
  } catch {
    return false
  }
}

export const getDesktopWebLoginUrl = async (nextUrl?: string): Promise<string | undefined> => {
  if (!nextUrl || !isServerUrl(nextUrl)) return nextUrl

  try {
    const normalizedNext = new URL(nextUrl, SERVER_URL).href
    const res = await api.post<{ login_url: string }>('/api/appdesktop/web-login/', {
      next: normalizedNext
    })
    return res.data.login_url || nextUrl
  } catch {
    return nextUrl
  }
}
