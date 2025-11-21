/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState, ReactNode, useMemo } from "react"
import { useAuth } from "@contexts/AuthContext"
import Dashboard from "../routes/pages/Dashboard"
import { Account } from "src/types/global"
import logo from '../assets/favicon.ico'

export type Tab = {
  id: string
  name: string
  title: string
  url?: string
  currentUrl?: string
  favicon?: string
  isLoading?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  component?: React.ComponentType
  viewReady?: boolean
}

export type Profile = {
  id: string
  icon: string
  name: string
  partition: string
  tabs: Tab[]
  currentTabId?: string
  account?: Account
  type: "external" | "internal"
}

export type ProfileContextType = {
  profiles: Profile[]
  setProfiles: (profiles: Profile[]) => void
  currentProfile: Profile | null
  setCurrentProfile: (profileId: string) => void
  currentTab: Tab | null
  addProfile: (profile: Profile) => void
  removeProfile: (profileId: string) => void
  addTab: (profileId: string, tab: Tab) => void
  closeTab: (profileId: string, tabId: string) => void
  switchTab: (profileId: string, tabId: string) => void
  updateTab: (profileId: string, tabId: string, updates: Partial<Tab>) => void
  updateProfile: (profileId: string, updates: Partial<Profile>) => void
  goBack: (tabId: string) => void
  goForward: (tabId: string) => void
  reload: (tabId: string) => void
  stop: (tabId: string) => void
  reorderTabs: (profileId: string, dragId: string, hoverId: string) => void
  injectScript: (tabId: string, script: string) => Promise<boolean>
  toggleFullscreen: (tabId: string) => Promise<boolean>
}

const ProfileContext = createContext<ProfileContextType | null>(null)

// -- DEFAULT DATA
const defaultProfile: Profile = {
  id: "1",
  partition: "app:dashboard",
  name: "Quản lý tài khoản",
  icon: logo,
  tabs: [
    {
      id: "1",
      name: "dashboard",
      title: "Quản lý tài khoản",
      favicon: logo,
      component: Dashboard,
      currentUrl: "toolsngon://dashboard"
    }
  ],
  currentTabId: "1",
  type: "internal"
}

export function ProfileProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [profiles, setProfiles] = useState<Profile[]>([defaultProfile])
  const [currentProfileId, setCurrentProfileId] = useState<string>("1")
  const webviewsRef = useRef<Map<string, Electron.WebviewTag>>(new Map())
  const { isAuthenticated } = useAuth()

  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === currentProfileId) ?? null
  }, [profiles, currentProfileId])

  const currentTab = useMemo(() => {
    return currentProfile?.tabs.find(t => t.id === currentProfile?.currentTabId) ?? null
  }, [currentProfile])

  // --- RESET WHEN LOGOUT
  useEffect(() => {
    if (!isAuthenticated) {
      webviewsRef.current.clear()
      // Destroy all BrowserViews when logging out
      window.api?.browserView?.destroyAll()
      setProfiles([defaultProfile])
      setCurrentProfileId("1")
    }
  }, [isAuthenticated])

  const addProfile = (profile: Profile): void => {
    setProfiles(prev => [...prev, profile])
  }

  const removeProfile = (profileId: string): void => {
    // Don't allow removing the default profile
    if (profileId === "1") return

    // Destroy all BrowserViews for this profile
    window.api?.browserView?.destroyProfile(profileId)

    setProfiles(prev => {
      const newProfiles = prev.filter(p => p.id !== profileId)
      // If we removed the current profile, switch to default
      if (currentProfileId === profileId) {
        setCurrentProfileId("1")
      }
      return newProfiles
    })
  }

  const setCurrentProfile = (profileId: string): void => {
    setCurrentProfileId(profileId)
  }

  // --- TAB ACTIONS ---
  const addTab = (profileId: string, newTab: Tab): void => {
    setProfiles(prev =>
      prev.map(p =>
        p.id === profileId
          ? { ...p, tabs: [...p.tabs, newTab], currentTabId: newTab.id }
          : p
      )
    )
  }

  const closeTab = (profileId: string, tabId: string): void => {
    // Don't allow closing the default dashboard tab
    if (tabId === "1") return

    // Destroy the BrowserView for this tab
    window.api?.browserView?.destroy(tabId, profileId)

    setProfiles(prev =>
      prev.map(p => {
        if (p.id !== profileId) return p
        const tabs = p.tabs.filter(t => t.id !== tabId)
        const currentTabId =
          p.currentTabId === tabId && tabs.length > 0
            ? tabs[tabs.length - 1].id
            : p.currentTabId
        return { ...p, tabs, currentTabId }
      })
    )
  }

  const switchTab = (profileId: string, tabId: string): void => {
    setProfiles(prev =>
      prev.map(p =>
        p.id === profileId ? { ...p, currentTabId: tabId } : p
      )
    )
  }

  const updateTab = (profileId: string, tabId: string, updates: Partial<Tab>): void => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id !== profileId) return p
        const tabs = p.tabs.map(t =>
          t.id === tabId ? { ...t, ...updates } : t
        )
        return { ...p, tabs }
      })
    )
  }

  const updateProfile = (profileId: string, updates: Partial<Profile>): void => {
    setProfiles(prev =>
      prev.map(p =>
        p.id === profileId ? { ...p, ...updates } : p
      )
    )
  }

  // --- ELECTRON NAVIGATION ---
  const goBack = (tabId: string): void => {
    window.api?.browserView?.back(tabId)
  }

  const goForward = (tabId: string): void => {
    window.api?.browserView?.forward(tabId)
  }

  const reload = (tabId: string): void => {
    window.api?.browserView?.reload(tabId)
  }

  const stop = (tabId: string): void => {
    window.api?.browserView?.stop(tabId)
  }

  const reorderTabs = (profileId: string, dragId: string, hoverId: string): void => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.id !== profileId) return p
        const tabs = [...p.tabs]
        const fromIndex = tabs.findIndex(t => t.id === dragId)
        const toIndex = tabs.findIndex(t => t.id === hoverId)
        if (fromIndex === -1 || toIndex === -1) return p
        const [moved] = tabs.splice(fromIndex, 1)
        tabs.splice(toIndex, 0, moved)
        return { ...p, tabs }
      })
    )
  }

  const injectScript = async (tabId: string, script: string): Promise<boolean> => {
    if (!script || !tabId) return false
    try {
      const result = await window.api?.browserView?.injectScript(tabId, script)
      return result === true
    } catch {
      return false
    }
  }

  const toggleFullscreen = async (tabId: string): Promise<boolean> => {
    if (!tabId) return false
    try {
      const result = await window.api?.browserView?.toggleFullscreen(tabId)
      return result === true
    } catch {
      return false
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        setProfiles,
        currentProfile,
        setCurrentProfile,
        currentTab,
        addProfile,
        removeProfile,
        addTab,
        closeTab,
        switchTab,
        updateTab,
        updateProfile,
        goBack,
        goForward,
        reload,
        stop,
        reorderTabs,
        injectScript,
        toggleFullscreen
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfiles = (): ProfileContextType => {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfiles must be used inside <ProfileProvider>")
  return ctx
}
