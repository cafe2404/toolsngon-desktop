import { BrowserWindow } from 'electron'

export function sendAppProtocolUrl(mainWindow: BrowserWindow, url?: string): boolean {
  if (!url?.startsWith('toolsngon://')) return false
  try {
    mainWindow.webContents.send('deep-link', url)
    return true
  } catch {
    return false
  }
}

export function getGoogleFaviconUrl(pageUrl?: string): string | undefined {
  if (!pageUrl) return undefined
  try {
    const parsedUrl = new URL(pageUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return undefined
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(parsedUrl.href)}/&size=40`
  } catch {
    return undefined
  }
}
