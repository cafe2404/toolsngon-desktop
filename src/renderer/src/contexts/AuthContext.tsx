/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@renderer/lib/axios'
import type { UserProduct } from 'src/types/global'
import { toast } from "sonner"


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
    userProducts: UserProduct[]
    userProductsLoading: boolean
    userProductsError: string | null
    loadUserProducts: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [refreshToken, setRefreshToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userProducts, setUserProducts] = useState<UserProduct[]>([])
    const [userProductsLoading, setUserProductsLoading] = useState<boolean>(false)
    const [userProductsError, setUserProductsError] = useState<string | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
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
        setUserProducts([])
        setUserProductsError(null)
        await window.auth.clear()
    }, [])

    const fetchMe = useCallback(async () => {
        if (!accessToken) return
        const res = await api.get('/api/user/me/')
        setUser(res.data)
    }, [accessToken])

    const loadUserProducts = useCallback(async () => {
        if (!accessToken) return
        try {
            setUserProductsLoading(true)
            setUserProductsError(null)
            const res = await api.get<UserProduct[]>('/api/user-products/')
            setUserProducts(res.data)
        } catch {
            setUserProductsError('Không thể tải danh sách sản phẩm')
        } finally {
            setUserProductsLoading(false)
        }
    }, [accessToken])

    const loginWithCode = useCallback(async ({ session_id, code }: { session_id: string; code: string }
    ) => {
        const deviceUUID = await window.os.getDeviceUUID()
        const appInfo = await window.os.getAppInfo()
        const res = await api.post('/api/app_auth/exchange_token/', { session_id, code, device_uuid: deviceUUID, app_info: appInfo })
        const data = res.data as { access: string; refresh: string, session_id: string }
        await saveTokens({ access: data.access, refresh: data.refresh })
        setSessionId(data.session_id)
    }, [saveTokens])

    const refresh = useCallback(async () => {
        if (!refreshToken) throw new Error('No refresh token')
        const deviceUUID = await window.os.getDeviceUUID()
        const appInfo = await window.os.getAppInfo()
        const res = await api.post('/api/app_auth/refresh/', {
            refresh: refreshToken,
            device_uuid: deviceUUID,
            app_info: appInfo
        })
        const data = res.data as { access: string }
        setAccessToken(data.access)
        await window.auth.save(data.access, refreshToken)
    }, [refreshToken])

    const logout = useCallback(async () => {
        try {
            // Close all tabs first
            await window.api?.browserView?.destroyAll?.()
            await window.api?.browserView?.clearAllData?.()
            await clearAuth()
        } catch {
            // noop
        }
    }, [clearAuth])


    useEffect(() => {
        (async () => {
            try {
                const stored = await window.auth.get()
                if (stored.access && stored.access) {
                    setRefreshToken(stored.refresh)
                    setAccessToken(stored.access)
                    try {
                        await fetchMe()
                        await loadUserProducts()
                    } catch {
                        await logout()
                    }
                }
            } finally {
                setIsLoading(false)
            }
        })()
    }, [fetchMe, loadUserProducts, refresh, logout])

    useEffect(() => {

        let ws: WebSocket | null = null

        const initWebSocket = async () => {
            const deviceUUID = await window.os.getDeviceUUID()
            try {
                const wsUrl = `${import.meta.env.VITE_WS_URL}/session/${sessionId}/`
                ws = new WebSocket(wsUrl)

                ws.onopen = () => console.log("[WS] Connected to", wsUrl)
                ws.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        console.log("[WS] Message:", data)

                        if (data.status === "deleted") {
                            console.warn("[WS] Session deleted → logout")
                            await logout()
                            const toastId = toast.error('Phiên đăng nhập không tồn tại', {
                                duration: Infinity,
                                action: {
                                    label: "Đóng",
                                    onClick: () => toast.dismiss(toastId),
                                },
                            })
                        } else if (data.status === "updated" && data.device_uuid !== deviceUUID) {
                            console.warn("[WS] Device changed → logout")
                            await logout()
                            const toastId = toast.error('Phiên đăng nhập của bạn đã hết hạn', {
                                duration: Infinity,
                                action: {
                                    label: "Đóng",
                                    onClick: () => toast.dismiss(toastId),
                                },
                            })
                        }
                    } catch (err) {
                        console.error("[WS] Invalid JSON:", err)
                    }
                }
                ws.onerror = (err) => console.error("[WS] Error:", err)
                ws.onclose = () => console.log("[WS] Disconnected")
            } catch (err) {
                console.error("[WS] Failed to init:", err)
            }
        }
        if (accessToken && sessionId) {
            initWebSocket()
        }
        return () => {
            if (ws) {
                ws.close()
                console.log("[WS] Closed connection")
            }
        }
    }, [accessToken, sessionId, logout])


    useEffect(() => {
        const getSessionId = async () => {
            try {
                const deviceUUID = await window.os.getDeviceUUID()
                const res = await api.post('/api/app_auth/session/', { device_uuid: deviceUUID })
                const data = res.data as { session_id: string }
                setSessionId(data.session_id)
            } catch {
                await logout()
                const toastId = toast.error('Phiên đăng nhập của bạn đã hết hạn', {
                    duration: Infinity,
                    action: {
                        label: "Đóng",
                        onClick: () => toast.dismiss(toastId),
                    },
                })
            }
        }
        if (!sessionId && accessToken) {
            getSessionId()
        }
    }, [sessionId, accessToken, logout])

    const value = useMemo<AuthContextType>(() => ({
        user,
        accessToken,
        refreshToken,
        isLoading,
        isAuthenticated,
        loginWithCode,
        logout,
        refresh,
        userProducts,
        userProductsLoading,
        userProductsError,
        loadUserProducts,
    }), [user, accessToken, refreshToken, isLoading, isAuthenticated, loginWithCode, logout, refresh, userProducts, userProductsLoading, userProductsError, loadUserProducts])

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


