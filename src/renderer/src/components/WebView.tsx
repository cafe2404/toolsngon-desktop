/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useRef } from "react"
import { Tab, useTabs } from "../contexts/TabContext"

export default function WebView(tab: Tab) {
    const webviewRef = useRef<Electron.WebviewTag>(null);
    const { currentTab, updateTab, registerWebview } = useTabs()
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return
        registerWebview(tab.id, webview)

        const handleDidFinishLoad = () => {
            try {
                const title = webview.getTitle()
                if (title) updateTab(tab.id, { title })
                updateTab(tab.id, {
                    isLoading: false,
                    canGoBack: webview.canGoBack(),
                    canGoForward: webview.canGoForward(),
                    currentUrl: webview.getURL(),
                })
            } catch {
                // ignore
            }
        }

        const handleDomReady = async () => {
            try {
                const favicon = `http://www.google.com/s2/favicons?domain=${webview.getURL()}`
                updateTab(tab.id, { favicon: favicon ?? undefined })
            } catch {
                // ignore favicon errors
            }
        }

        const handlePageTitleUpdated = () => {
            try {
                const title = webview.getTitle()
                if (title) updateTab(tab.id, { title })
            } catch {
                // ignore
            }
        }

        const handleDidNavigate = () => {
            try {
                const currentUrl = webview.getURL()
                if (currentUrl) updateTab(tab.id, { currentUrl })
                updateTab(tab.id, { canGoBack: webview.canGoBack(), canGoForward: webview.canGoForward() })
            } catch {
                // ignore
            }
        }
        const handleDidNavigateInPage = () => {
            try {
                const currentUrl = webview.getURL()
                if (currentUrl) updateTab(tab.id, { currentUrl })
                updateTab(tab.id, { canGoBack: webview.canGoBack(), canGoForward: webview.canGoForward() })
            } catch {
                // ignore
            }
        }

        const handleDidStartLoading = () => {
            updateTab(tab.id, { isLoading: true })
        }
        const handleDidStopLoading = () => {
            try {
                updateTab(tab.id, {
                    isLoading: false,
                    canGoBack: webview.canGoBack(),
                    canGoForward: webview.canGoForward(),
                    currentUrl: webview.getURL(),
                })
            } catch {
                // ignore
            }
        }
        const handleDidFailLoad = (event: { errorCode: number }) => {
            if (event.errorCode === -3) return
            updateTab(tab.id, { isLoading: false })
        }
        // Khi trang cố gắng mở popup
        const handleWillNavigate = (e: any) => {
            if (e.url && e.url !== webview.getURL()) {
                e.preventDefault?.()
                webview.loadURL(e.url) // 👉 Chuyển hướng popup vào chính webview này
            }
        }

        // Một số site không dùng 'new-window' mà dùng 'will-navigate'
        webview.addEventListener('new-window', handleWillNavigate)
        webview.addEventListener('will-navigate', handleWillNavigate)
        webview.addEventListener("did-start-loading", handleDidStartLoading)
        webview.addEventListener("did-stop-loading", handleDidStopLoading)
        webview.addEventListener("did-finish-load", handleDidFinishLoad)
        webview.addEventListener("did-fail-load", handleDidFailLoad as any)
        webview.addEventListener("dom-ready", handleDomReady)
        webview.addEventListener("page-title-updated", handlePageTitleUpdated)
        webview.addEventListener("did-navigate", handleDidNavigate)
        webview.addEventListener("did-navigate-in-page", handleDidNavigateInPage)

        return () => {
            webview.removeEventListener("did-start-loading", handleDidStartLoading)
            webview.removeEventListener("did-stop-loading", handleDidStopLoading)
            webview.removeEventListener("did-finish-load", handleDidFinishLoad)
            webview.removeEventListener("did-fail-load", handleDidFailLoad as any)
            webview.removeEventListener("dom-ready", handleDomReady)
            webview.removeEventListener("page-title-updated", handlePageTitleUpdated)
            webview.removeEventListener("did-navigate", handleDidNavigate)
            webview.removeEventListener("did-navigate-in-page", handleDidNavigateInPage)
            webview.removeEventListener('new-window', handleWillNavigate)
            webview.removeEventListener('will-navigate', handleWillNavigate)

            registerWebview(tab.id, null)
        }
    }, [tab.id, updateTab, registerWebview])

    return (
        <div className="w-full h-full" style={{ display: tab.id === currentTab.id ? "block" : "none" }}>
            <webview
                ref={webviewRef}
                src={tab.url}
                className="w-full h-full "
            ></webview>
        </div>
    )
}
