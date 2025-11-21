import { useEffect } from "react"
import { useProfiles } from "../../contexts/ProfileContext"

const TabListener = (): null => {
    const { addTab, currentProfile, currentTab } = useProfiles()

    useEffect(() => {
        const unsubscribe = window.api.browserView.onNewTab(async (url) => {
            if (!currentProfile) return
            if (currentProfile.account?.is_create_tab) {
                const newTabId = `tab_${Date.now()}`
                await addTab(currentProfile?.id, {
                    id: newTabId,
                    name: "New Tab",
                    title: 'New Tab',
                    url: url,
                    currentUrl: url
                })
            } else {
                if (!currentTab?.id) return
                window.api.browserView.navigate(currentTab?.id, url)
            }
        })
        return () => { try { (unsubscribe as unknown as (() => void) | undefined)?.() } catch { /* noop */ } }
    }, [currentProfile, addTab, currentTab])
    return null
}

export default TabListener;
