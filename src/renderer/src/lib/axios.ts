/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Axios, { AxiosRequestHeaders } from 'axios'

const BASE_URL = import.meta.env.VITE_SERVER_URL
async function getStoredTokens(): Promise<{ access: string | null; refresh: string | null }> {
  return window.auth.get()
}

async function setStoredTokens(tokens: {
  access: string | null
  refresh: string | null
}): Promise<void> {
  if (typeof window !== 'undefined' && window.auth) {
    if (tokens.access && tokens.refresh) {
      await window.auth.save(tokens.access, tokens.refresh)
    } else {
      await window.auth.clear()
    }
  }
}

export const api = Axios.create({
  baseURL: BASE_URL,
  withCredentials: false
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string | null) => void
  reject: (err: unknown) => void
}> = []

function subscribeTokenRefresh(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject })
  })
}

function onRefreshed(token: string | null) {
  pendingQueue.forEach((p) => p.resolve(token))
  pendingQueue = []
}

function onRefreshFailed(err: unknown) {
  pendingQueue.forEach((p) => p.reject(err))
  pendingQueue = []
}

api.interceptors.request.use(async (config) => {
  const { access } = await getStoredTokens()
  if (access) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders
    if (!('Authorization' in headers)) {
      headers.Authorization = `Bearer ${access}`
    }
    config.headers = headers
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }
    if (error.response?.status === 401) {
      if (isRefreshing) {
        const newToken = await subscribeTokenRefresh()
        if (newToken) {
          const headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders
          headers.Authorization = `Bearer ${newToken}`
          originalRequest.headers = headers
        }
        return api(originalRequest)
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const { refresh } = await getStoredTokens()
        if (!refresh) throw new Error('No refresh token')
        const device_uuid = await window.os.getDeviceUUID()
        const appInfo = await window.os.getAppInfo()
        const refreshRes = await Axios.post(`${BASE_URL}/api/app_auth/refresh/`, {
          refresh,
          device_uuid,
          app_info: appInfo
        })
        const nextAccess = refreshRes.data.access as string
        await setStoredTokens({ access: nextAccess, refresh })
        onRefreshed(nextAccess)
        const headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders
        headers.Authorization = `Bearer ${nextAccess}`
        originalRequest.headers = headers
        return api(originalRequest)
      } catch (e) {
        await setStoredTokens({ access: null, refresh: null })
        onRefreshFailed(e)
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
