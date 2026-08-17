const PRODUCTION_SERVER_URL = 'https://toolsngon.com'

const configuredServerUrl = import.meta.env.VITE_SERVER_URL?.trim()

export const SERVER_URL = (configuredServerUrl || PRODUCTION_SERVER_URL).replace(/\/+$/, '')

const configuredWebSocketUrl = import.meta.env.VITE_WS_URL?.trim()

export const WS_URL = (
  configuredWebSocketUrl || `${SERVER_URL.replace(/^http/, 'ws')}/ws`
).replace(/\/+$/, '')
