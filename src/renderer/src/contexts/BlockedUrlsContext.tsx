/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { blockedUrlsApi, type BlockedUrl } from "@renderer/lib/blockedUrls"
import { useAuth } from "@contexts/AuthContext"

type BlockedUrlsContextType = {
  blockedUrls: BlockedUrl[]
  blockedKeywords: string[]
  isLoading: boolean
  error: string | null
  refreshBlockedUrls: () => Promise<void>
  isUrlBlocked: (url: string) => boolean
}

const BlockedUrlsContext = createContext<BlockedUrlsContextType | null>(null)

export function BlockedUrlsProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [blockedUrls, setBlockedUrls] = useState<BlockedUrl[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const blockedKeywords = blockedUrls.map(item => item.keyword)

  const refreshBlockedUrls = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      setIsLoading(true)
      setError(null)
      const urls = await blockedUrlsApi.getBlockedUrls()
      setBlockedUrls(urls)
    } catch (err) {
      setError('Không thể tải danh sách URL bị chặn')
      console.error('Failed to load blocked URLs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const isUrlBlocked = useCallback((url: string): boolean => {
    return blockedUrlsApi.isUrlBlocked(url, blockedKeywords)
  }, [blockedKeywords])

  // Load blocked URLs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshBlockedUrls()
    } else {
      // Clear blocked URLs when logged out
      setBlockedUrls([])
      setError(null)
    }
  }, [isAuthenticated, refreshBlockedUrls])

  // Refresh blocked URLs every 5 minutes
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      refreshBlockedUrls()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshBlockedUrls])

  return (
    <BlockedUrlsContext.Provider
      value={{
        blockedUrls,
        blockedKeywords,
        isLoading,
        error,
        refreshBlockedUrls,
        isUrlBlocked
      }}
    >
      {children}
    </BlockedUrlsContext.Provider>
  )
}

export const useBlockedUrls = (): BlockedUrlsContextType => {
  const ctx = useContext(BlockedUrlsContext)
  if (!ctx) throw new Error("useBlockedUrls must be used inside <BlockedUrlsProvider>")
  return ctx
}
