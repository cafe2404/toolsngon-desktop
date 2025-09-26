/* eslint-disable react-refresh/only-export-components */
// src/context/TabContext.tsx
import { createContext, useContext, useRef, useState, ReactNode } from "react"

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
}

export type TabContextType = {
  tabs: Tab[]
  currentTab: Tab
  addTab: (tab: Tab) => void
  closeTab: (id: string) => void
  switchTab: (id: string) => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  registerWebview: (id: string, webview: Electron.WebviewTag | null) => void
  goBack: (id: string) => void
  goForward: (id: string) => void
  reload: (id: string) => void
  stop: (id: string) => void
}

const TabContext = createContext<TabContextType | null>(null)

export function TabProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", name: "dashboard", title: "Trang chủ", type: "internal" },
  ])
  const [currentTab, setCurrentTab] = useState<Tab>(tabs[0])
  const webviewsRef = useRef<Map<string, Electron.WebviewTag>>(new Map())

  const addTab = (newTab: Tab): void => {
    setTabs([...tabs, newTab])
    setCurrentTab(newTab)
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
      const nextTabs = prevTabs.map(tab => (tab.id === id ? { ...tab, ...updates } : tab))
      const updated = nextTabs.find(t => t.id === id)
      if (updated && currentTab.id === id) {
        setCurrentTab(updated)
      }
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

  const withWebview = (id: string, fn: (wv: Electron.WebviewTag) => void): void => {
    const wv = webviewsRef.current.get(id)
    if (!wv) return
    try {
      fn(wv)
    } catch {
      // ignore
    }
  }

  const goBack = (id: string): void => {
    withWebview(id, wv => {
      if (wv.canGoBack()) wv.goBack()
    })
  }

  const goForward = (id: string): void => {
    withWebview(id, wv => {
      if (wv.canGoForward()) wv.goForward()
    })
  }

  const reload = (id: string): void => {
    withWebview(id, wv => wv.reload())
  }

  const stop = (id: string): void => {
    withWebview(id, wv => wv.stop())
    updateTab(id, { isLoading: false })
  }

  return (
    <TabContext.Provider value={{ tabs, currentTab, addTab, closeTab, switchTab, updateTab, registerWebview, goBack, goForward, reload, stop }}>
      {children}
    </TabContext.Provider>
  )
}

export const useTabs = (): TabContextType => {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error("useTabs must be used inside <TabProvider>")
  return ctx
}
