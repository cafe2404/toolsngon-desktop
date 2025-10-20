import { useEffect, useLayoutEffect, useRef } from "react"
import { Tab, useProfiles } from "../contexts/ProfileContext"

export default function WebView({ tab, profileID, isActive }: { tab: Tab, profileID: string, isActive?: boolean }): React.JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)
    const { currentTab, updateTab, currentProfile } = useProfiles()

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
        // Only attach if this is the first time this tab is being rendered
        if (!tab.viewReady) {
            window.api?.browserView?.attach(
                id, initialUrl,
                currentProfile?.account,
                calcBounds(),
                false,
                profileID
            )
            updateTab(profileID, id, { viewReady: true })
        }
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
            updateTab(profileID, id, payload.updates as Partial<Tab>)
        }
        // @ts-ignore: exposed by preload (api.onBrowserViewUpdate)
        const unsubscribe = window.api?.onBrowserViewUpdate(updateHandler)

        return (): void => {
            window.removeEventListener('resize', onResize)
            if (ro) ro.disconnect()
            // @ts-ignore: exposed by preload (api.browserView.destroy)
            window.api?.browserView?.destroy(id, profileID)
            updateTab(profileID, id, { viewReady: false })
            if (typeof unsubscribe === 'function') unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab.id, profileID])

    // When this tab becomes current, bring its BrowserView to front and refresh bounds
    useEffect((): void => {
        if (!isActive || currentTab?.id !== tab.id) return
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
        window.api?.browserView?.focus(id)
        window.api?.browserView?.setBounds(id, calcBounds())
    }, [isActive, currentTab?.id, tab.id, profileID])
    return (
        <div ref={containerRef} className="w-full h-full" style={{ display: tab.id === currentTab?.id ? "block" : "none" }} />
    )
}
