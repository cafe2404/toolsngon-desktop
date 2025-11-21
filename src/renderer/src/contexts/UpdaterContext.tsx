/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-refresh/only-export-components */
// src/contexts/UpdaterContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

type UpdateStatus =
    | "idle"
    | "checking"
    | "available"
    | "downloading"
    | "downloaded"
    | "error"
    | "not-available"

interface UpdaterContextType {
    status: UpdateStatus
    progress: number
    error?: string
}

const UpdaterContext = createContext<UpdaterContextType>({
    status: "idle",
    progress: 0,
})

export const UpdaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate()
    const [status, setStatus] = useState<UpdateStatus>("idle")
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | undefined>()

    useEffect(() => {
        const u = window.update
        if (!u) return

        const offChecking = u.onUpdateChecking(() => setStatus("checking"))

        const offAvailable = u.onUpdateAvailable(() => {
            setStatus("available")
            navigate("/updater")
        })

        const offProgress = u.onUpdateProgress((data) => {
            setStatus("downloading")
            setProgress(data.percent ?? 0)
        })

        const offDownloaded = u.onUpdateDownloaded(() => {
            setStatus("downloaded")
        })
        const offError = u.onUpdateError((err) => {
            setStatus("error")
            setError(err.message)
        })
        const offNotAvailable = u.onUpdateNotAvailable(() => setStatus("not-available"))
        return () => {
            offChecking?.()
            offAvailable?.()
            offProgress?.()
            offDownloaded?.()
            offError?.()
            offNotAvailable?.()
        }
    }, [navigate])

    return (
        <UpdaterContext.Provider value={{ status, progress, error }}>
            {children}
        </UpdaterContext.Provider>
    )
}

export const useUpdater = () => useContext(UpdaterContext)
