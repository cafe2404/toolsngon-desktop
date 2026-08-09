import { BrowserWindow, WebContentsView } from 'electron'

export const VIEW_TOP_OFFSET = 44

export type BoundsLike = {
  x: number
  y: number
  width: number
  height: number
}

export function computeBounds(bounds: BoundsLike): Electron.Rectangle {
  return bounds as Electron.Rectangle
}

export function computeFullscreenBounds(mainWindow: BrowserWindow): Electron.Rectangle {
  const content = mainWindow.getContentBounds()
  const isWinFs = mainWindow.isFullScreen?.() === true
  const topOffset = isWinFs ? 0 : VIEW_TOP_OFFSET
  return computeBounds({
    x: 0,
    y: topOffset,
    width: content.width,
    height: content.height - topOffset
  })
}

export function destroyWebContentsView(view: WebContentsView): void {
  try {
    if (!view.webContents.isDestroyed()) {
      view.webContents.close()
    }
  } catch {
    /* noop */
  }
}
