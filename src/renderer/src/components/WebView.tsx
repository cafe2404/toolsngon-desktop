import { useEffect, useLayoutEffect, useRef } from 'react'
import { Tab, useProfiles } from '../contexts/ProfileContext'
import { getDesktopWebLoginUrl } from '../lib/desktopWebLogin'
import { desktop } from '@renderer/lib/desktop'

export default function WebView({
  tab,
  profileID,
  isActive
}: {
  tab: Tab
  profileID: string
  isActive?: boolean
}): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDetachedRef = useRef(tab.isDetached === true)
  const { currentTab, updateTab, currentProfile } = useProfiles()

  useEffect(() => {
    isDetachedRef.current = tab.isDetached === true
  }, [tab.isDetached])

  useLayoutEffect((): (() => void) => {
    const id = tab.id
    const initialUrl = tab.url
    const calcBounds = (): { x: number; y: number; width: number; height: number } => {
      const el = containerRef.current
      if (!el) return { x: 0, y: 0, width: 0, height: 0 }
      const rect = el.getBoundingClientRect()
      return {
        x: Math.floor(rect.left),
        y: Math.floor(rect.top),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      }
    }
    let cancelled = false
    const updateHandler = (payload: { id: string; updates: Record<string, unknown> }): void => {
      if (payload.id !== id) return
      updateTab(profileID, id, payload.updates as Partial<Tab>)
    }
    const unsubscribe = desktop.browser.tabs.onUpdated(updateHandler)

    // Only attach if this is the first time this tab is being rendered
    if (!tab.viewReady) {
      getDesktopWebLoginUrl(initialUrl).then(async (targetUrl) => {
        if (cancelled) return
        const result = await desktop.browser.tabs.attach(
          id,
          targetUrl || initialUrl,
          currentProfile?.account,
          calcBounds(),
          false,
          profileID
        )
        if (cancelled) return
        updateTab(profileID, id, { viewReady: result.ok, webContentsId: result.webContentsId })
      })
    }
    const onResize = (): void => {
      if (isDetachedRef.current) return
      desktop.browser.tabs.setBounds(id, calcBounds())
    }
    window.addEventListener('resize', onResize)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => onResize())
      ro.observe(containerRef.current)
    }

    return (): void => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
      desktop.browser.tabs.destroy(id, profileID)
      updateTab(profileID, id, { viewReady: false })
      if (typeof unsubscribe === 'function') unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab.id, profileID])

  // When this tab becomes current, bring its BrowserView to front and refresh bounds
  useEffect((): void => {
    if (!isActive || currentTab?.id !== tab.id) return
    if (tab.isDetached) return
    const id = tab.id
    const calcBounds = (): { x: number; y: number; width: number; height: number } => {
      const el = containerRef.current
      if (!el) return { x: 0, y: 0, width: 0, height: 0 }
      const rect = el.getBoundingClientRect()
      return {
        x: Math.floor(rect.left),
        y: Math.floor(rect.top),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      }
    }
    desktop.browser.tabs.focus(id)
    desktop.browser.tabs.setBounds(id, calcBounds())
  }, [isActive, currentTab?.id, tab.id, profileID, tab.isDetached])
  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ display: tab.id === currentTab?.id && !tab.isDetached ? 'block' : 'none' }}
    />
  )
}
