/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@renderer/lib/axios'

type User = {
    id: number
    email: string
    username?: string,
    avatar_url?: string
}

type AuthContextType = {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isLoading: boolean
    isAuthenticated: boolean
    loginWithCode: (params: { session_id: string; code: string }) => Promise<void>
    logout: () => Promise<void>
    refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [refreshToken, setRefreshToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!accessToken

    const saveTokens = useCallback(async (next: { access: string; refresh: string }) => {
        setAccessToken(next.access)
        setRefreshToken(next.refresh)
        await window.auth.save(next.access, next.refresh)
    }, [])

    const clearAuth = useCallback(async () => {
        setAccessToken(null)
        setRefreshToken(null)
        setUser(null)
        await window.auth.clear()
    }, [])

    const fetchMe = useCallback(async () => {
        if (!accessToken) return
        const res = await api.get('/api/user/me/')
        setUser(res.data)
    }, [accessToken])

    const loginWithCode = useCallback(async ({ session_id, code }: { session_id: string; code: string }) => {
        const res = await api.post('/api/app_auth/exchange_token/', { session_id, code })
        const data = res.data as { access: string; refresh: string }
        await saveTokens({ access: data.access, refresh: data.refresh })
        await fetchMe()
    }, [fetchMe, saveTokens])

    const refresh = useCallback(async () => {
        if (!refreshToken) throw new Error('No refresh token')
        const res = await api.post('/api/token/refresh/', { refresh: refreshToken })
        const data = res.data as { access: string }
        setAccessToken(data.access)
        await window.auth.save(data.access, refreshToken)
    }, [refreshToken])

    const logout = useCallback(async () => {
        await clearAuth()
    }, [clearAuth])

    useEffect(() => {
        (async () => {
            try {
                const stored = await window.auth.get()
                setAccessToken(stored.access)
                setRefreshToken(stored.refresh)
                if (stored.access) {
                    await fetchMe()
                }
            } finally {
                setIsLoading(false)
            }
        })()
    }, [fetchMe])

    const value = useMemo<AuthContextType>(() => ({
        user,
        accessToken,
        refreshToken,
        isLoading,
        isAuthenticated,
        loginWithCode,
        logout,
        refresh,
    }), [user, accessToken, refreshToken, isLoading, isAuthenticated, loginWithCode, logout, refresh])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}


