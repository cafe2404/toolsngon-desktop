/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
// src/context/TabContext.tsx
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react"
import { useAuth } from "@contexts/AuthContext"
import Dashboard from "../routes/pages/Dashboard"
import { Account } from "src/types/global"

export type Tab = {
  id: string
  name: string
  title: string
  url?: string
  currentUrl?: string
  favicon?: string
  type: "external" | "internal"
  isLoading?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  component?: React.ComponentType
  account?: Account
  viewReady?: boolean
}

export type TabContextType = {
  tabs: Tab[]
  setTabs: (tabs: Tab[]) => void
  currentTab: Tab
  splitTabs: string[] | null
  addTab: (tab: Tab) => void
  openUrl: (url: string) => void
  closeTab: (id: string) => void
  switchTab: (id: string) => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  registerWebview: (id: string, webview: Electron.WebviewTag | null) => void
  goBack: (id: string) => void
  goForward: (id: string) => void
  reload: (id: string) => void
  stop: (id: string) => void
  reorderTabs: (dragId: string, hoverId: string) => void
  toggleSplit: () => void
  clearSplit: () => void
  injectScript: (id: string, script: Account) => Promise<boolean>
  getCurrentAccount: (tabId: string) => Account | undefined
}

const TabContext = createContext<TabContextType | null>(null)

const initialTabs: Tab[] = [
  { id: "1", name: "dashboard", title: "Quản lý tài khoản", type: "internal", component: Dashboard, currentUrl: "https://www.toolsngon.com/dashboard/" },
]

export function TabProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs)
  const tabsRef = useRef<Tab[]>(tabs)
  const [currentTab, setCurrentTab] = useState<Tab>(tabs[0])
  const [splitTabs, setSplitTabs] = useState<string[] | null>(null)
  const webviewsRef = useRef<Map<string, Electron.WebviewTag>>(new Map())
  const { isAuthenticated } = useAuth()

  const clearAllData = (): void => {
    try {
      window.api?.browserView?.destroyAll?.()
      window.api?.browserView?.clearAllData?.()
    } catch { /* noop */ }
    webviewsRef.current.clear()
    const defaultTabs: Tab[] = initialTabs
    setTabs(defaultTabs)
    setCurrentTab(tabs[0])
    setSplitTabs(null)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllData()
    }
  }, [isAuthenticated])

  // keep a ref of latest tabs for async checks
  useEffect(() => {
    tabsRef.current = tabs
  }, [tabs])

  const addTab = async (newTab: Tab): Promise<void> => {
    if (tabs.find(tab => tab.id === newTab.id)) {
      switchTab(newTab.id)
      return
    }
    setTabs([...tabs, newTab])
    setCurrentTab(newTab)
  }

  const openUrl = (url: string): void => {
    const id = `${Date.now()}`
    const tab: Tab = {
      id,
      name: `tab-${id}`,
      title: url,
      url,
      type: 'external'
    }
    setTabs(prev => [...prev, tab])
    setCurrentTab(tab)
  }

  const closeTab = (id: string): void => {
    const filtered = tabs.filter(t => t.id !== id)
    setTabs(filtered)
    if (currentTab.id === id && filtered.length > 0) {
      setCurrentTab(filtered[filtered.length - 1])
    }
  }

  const switchTab = (id: string): void => {
    setCurrentTab(tabs.find(tab => tab.id === id) ?? tabs[0])
  }

  const updateTab = (id: string, updates: Partial<Tab>): void => {
    setTabs(prevTabs => {
      const index = prevTabs.findIndex(tab => tab.id === id)
      if (index === -1) return prevTabs
      const old = prevTabs[index]
      const merged = { ...old, ...updates }
      // shallow compare to avoid pointless re-renders
      let changed = false
      for (const k of Object.keys(updates) as Array<keyof Tab>) {
        if (updates[k] !== old[k]) { changed = true; break }
      }
      if (!changed) return prevTabs
      const nextTabs = prevTabs.slice()
      nextTabs[index] = merged

      if (currentTab.id === id) setCurrentTab(merged)
      return nextTabs
    })
  }

  const registerWebview = (id: string, webview: Electron.WebviewTag | null): void => {
    if (webview) {
      webviewsRef.current.set(id, webview)
    } else {
      webviewsRef.current.delete(id)
    }
  }

  // Legacy helper removed; BrowserView now handles navigation exclusively

  const goBack = (id: string): void => {
    try {
      // @ts-ignore: exposed by preload for BrowserView navigation
      window.api?.browserView?.back(id)
    } catch { /* noop */ }
  }

  const goForward = (id: string): void => {
    try {
      // @ts-ignore: exposed by preload for BrowserView navigation
      window.api?.browserView?.forward(id)
    } catch { /* noop */ }
  }

  const reload = async (id: string): Promise<void> => {
    try {
      // @ts-ignore: exposed by preload for BrowserView navigation
      await window.api?.browserView?.reload(id)
    } catch { /* noop */ }
  }

  const stop = (id: string): void => {
    try {
      // @ts-ignore: exposed by preload for BrowserView navigation
      window.api?.browserView?.stop(id)
    } catch { /* noop */ }
    updateTab(id, { isLoading: false })
  }

  const reorderTabs = (dragId: string, hoverId: string): void => {
    if (dragId === hoverId) return
    setTabs(prev => {
      const fromIndex = prev.findIndex(t => t.id === dragId)
      const toIndex = prev.findIndex(t => t.id === hoverId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const next = prev.slice()
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      const nextCurrent = next.find(t => t.id === currentTab.id)
      if (nextCurrent && nextCurrent !== currentTab) setCurrentTab(nextCurrent)
      return next
    })
  }

  const toggleSplit = (): void => {
    if (splitTabs && splitTabs.length > 0) {
      setSplitTabs(null)
      return
    }
    const others = tabs.filter(t => t.id !== currentTab.id && t.type === 'external')
    if (others.length > 0) {
      setSplitTabs([currentTab.id, others[0].id])
    }
  }

  const clearSplit = (): void => setSplitTabs(null)

  const injectScript = async (id: string, account: Account): Promise<boolean> => {
    try {
      console.log(id)
      const tab = tabsRef.current.find(t => t.id === id)
      if (!tab || tab.type !== 'external') return false
      if (!account.script || typeof account.script !== 'string' || account.script.trim().length === 0) return false
      const waitUntil = async (
        predicate: () => boolean,
        timeoutMs: number = 5000,
        intervalMs: number = 100
      ): Promise<boolean> => {
        const start = Date.now()
        return await new Promise((resolve: (value: boolean) => void): void => {
          const tick = (): void => {
            if (predicate()) return resolve(true)
            if (Date.now() - start >= timeoutMs) return resolve(false)
            setTimeout(tick, intervalMs)
          }
          tick()
        })
      }
      const ok: boolean = await waitUntil((): boolean => {
        const t = tabsRef.current.find((x) => x.id === id)
        return Boolean(t?.viewReady)
      })
      if (!ok) return false
      const result = await window.api?.browserView?.injectScript(
        id,
        account.script
      )
      return result === true
    } catch {
      return false
    }
  }

  const getCurrentAccount = (tabId: string): Account | undefined => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || !tab.account) return undefined
    return tab.account
  }


 

  return (
    <TabContext.Provider value={{
      tabs, setTabs,
      currentTab,
      splitTabs,
      addTab, openUrl, closeTab, switchTab, updateTab,
      registerWebview,
      goBack, goForward, reload, stop, reorderTabs,
      toggleSplit, clearSplit, injectScript,
      getCurrentAccount
    }}>
      {children}
    </TabContext.Provider>
  )
}

export const useTabs = (): TabContextType => {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error("useTabs must be used inside <TabProvider>")
  return ctx
}
