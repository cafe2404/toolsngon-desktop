import { useEffect } from "react"
import { useProfiles } from "../../contexts/ProfileContext"

const TabListener = (): null => {
    const { addTab, currentProfile, currentTab } = useProfiles()

    useEffect(() => {
        const unsubscribe = window.api.browserView.onNewTab(async (payload) => {
            if (!currentProfile) return
            const tabUrl = typeof payload === 'string' ? payload : payload.url
            const shouldCreateTab = currentProfile.account?.is_create_tab || (typeof payload !== 'string' && payload.forceCreate)
            if (shouldCreateTab) {
                const newTabId = typeof payload === 'string' ? `tab_${Date.now()}` : payload.id || `tab_${Date.now()}`
                await addTab(currentProfile?.id, {
                    id: newTabId,
                    name: typeof payload === 'string' ? "New Tab" : payload.title || "New Tab",
                    title: typeof payload === 'string' ? 'New Tab' : payload.title || 'New Tab',
                    url: tabUrl,
                    currentUrl: tabUrl,
                    viewReady: typeof payload === 'string' ? undefined : payload.viewReady,
                    webContentsId: typeof payload === 'string' ? undefined : payload.webContentsId
                })
            } else {
                if (!currentTab?.id) return
                window.api.browserView.navigate(currentTab?.id, tabUrl)
            }
        })
        return () => { try { (unsubscribe as unknown as (() => void) | undefined)?.() } catch { /* noop */ } }
    }, [currentProfile, addTab, currentTab])
    return null
}

export default TabListener;
