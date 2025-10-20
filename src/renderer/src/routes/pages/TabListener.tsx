import { useEffect } from "react"
import { useProfiles } from "../../contexts/ProfileContext"

const TabListener = (): null => {
    const { addTab, currentProfile } = useProfiles()

    useEffect(() => {
        const unsubscribe = window.api.browserView.onNewTab(async (url) => {
            if (!currentProfile) return
            const newTabId = `tab_${Date.now()}`
            await addTab(currentProfile?.id, {
                id: newTabId,
                name: "New Tab",
                title: 'New Tab',
                url: url,
                currentUrl: url
            })
        })
        return () => { try { (unsubscribe as unknown as (() => void) | undefined)?.() } catch { /* noop */ } }
    }, [currentProfile, addTab])
    return null
}

export default TabListener;
