import { useEffect, useLayoutEffect, useRef } from "react"
import { Tab, useTabs } from "../contexts/TabContext"

export default function WebView({ tab }: { tab: Tab }): React.JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)
    const { currentTab, updateTab } = useTabs()

    // Attach a BrowserView for this tab on mount and manage its bounds
    useLayoutEffect((): () => void => {
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
                height: Math.floor(rect.height),
            }
        }
        window.api?.browserView?.attach(id, initialUrl, calcBounds(), false)
        updateTab(id, { viewReady: true })
        // No injection here; handled by the caller after tab creation

        const onResize = (): void => {
            // @ts-ignore: exposed by preload (api.browserView.setBounds)
            window.api?.browserView?.setBounds(id, calcBounds())
        }
        window.addEventListener('resize', onResize)

        let ro: ResizeObserver | null = null
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            ro = new ResizeObserver(() => onResize())
            ro.observe(containerRef.current)
        }

        const updateHandler = (payload: { id: string; updates: Record<string, unknown> }): void => {
            if (payload.id !== id) return
            updateTab(id, payload.updates as Partial<Tab>)
        }
        // @ts-ignore: exposed by preload (api.onBrowserViewUpdate)
        const unsubscribe = window.api?.onBrowserViewUpdate(updateHandler)

        return (): void => {
            window.removeEventListener('resize', onResize)
            if (ro) ro.disconnect()
            // @ts-ignore: exposed by preload (api.browserView.destroy)
            window.api?.browserView?.destroy(id)
            updateTab(id, { viewReady: false})
            if (typeof unsubscribe === 'function') unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab.id])

    // When this tab becomes current, bring its BrowserView to front and refresh bounds
    useEffect((): void => {
        if (currentTab.id !== tab.id) return
        const id = tab.id
        const calcBounds = (): { x: number; y: number; width: number; height: number } => {
            const el = containerRef.current
            if (!el) return { x: 0, y: 0, width: 0, height: 0 }
            const rect = el.getBoundingClientRect()
            return {
                x: Math.floor(rect.left),
                y: Math.floor(rect.top),
                width: Math.floor(rect.width),
                height: Math.floor(rect.height),
            }
        }
        // Re-attach without URL to just focus/show this BrowserView
        // Double-check current tab right before attach to avoid races
        if (currentTab.id === id) {
            // @ts-ignore: exposed by preload (api.browserView.attach)
            window.api?.browserView?.attach(id, undefined, calcBounds(), true)
            // @ts-ignore: exposed by preload (api.browserView.setBounds)
            window.api?.browserView?.setBounds(id, calcBounds())
        }
    }, [currentTab.id, tab.id])

    return (
        <div ref={containerRef} className="w-full h-full" style={{ display: tab.id === currentTab.id ? "block" : "none" }} />
    )
}
