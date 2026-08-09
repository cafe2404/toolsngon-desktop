/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@renderer/lib/axios'
import { useAuth } from '@contexts/AuthContext'
import { toast } from 'sonner'
import { useLanguage } from '@renderer/contexts/LanguageContext'

export default function Login() {
  const navigate = useNavigate()
  const loginViewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const getLoginViewBounds = useCallback(() => {
    const rect = loginViewRef.current?.getBoundingClientRect()
    if (!rect) return null

    return {
      x: Math.floor(rect.left),
      y: Math.floor(rect.top),
      width: Math.floor(rect.width),
      height: Math.floor(rect.height)
    }
  }, [])

  const closeLoginView = useCallback(() => {
    window.api.authLoginView.close()
    setLoading(false)
  }, [])

  const createSession = async () => {
    try {
      setLoading(true)
      const res = await api.post('/api/app_auth/create_session/')
      const session_id = res.data.session_id
      const loginUrl = `${import.meta.env.VITE_SERVER_URL}/app_auth/${session_id}/grant/?desktop_callback=web`
      requestAnimationFrame(() => {
        const bounds = getLoginViewBounds()
        if (bounds) {
          window.api.authLoginView.open(loginUrl, bounds)
        } else {
          window.api.openExternal(loginUrl)
        }
      })
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || err?.response?.data?.message || t('common.unknownError')
      console.log('err', errorMsg)
      const toastId = toast.error(errorMsg, {
        duration: Infinity,
        action: {
          label: t('common.close'),
          onClick: () => toast.dismiss(toastId)
        }
      })
      setLoading(false)
      alert('❌ ' + JSON.stringify(err.toJSON(), null, 2))
    }
  }

  useEffect(() => {
    const unsubscribe = window.api.onDeepLink((url) => {
      const parsed = new URL(url)
      if (parsed.host === 'auth') {
        window.api.authLoginView.close()
        navigate('/auth/callback' + parsed.search)
      }
      setLoading(false)
    })
    return () => {
      try {
        ;(unsubscribe as unknown as (() => void) | undefined)?.()
      } catch {
        /* noop */
      }
    }
  }, [navigate])

  useEffect(() => {
    if (!loading) return

    const updateBounds = (): void => {
      const bounds = getLoginViewBounds()
      if (bounds) {
        window.api.authLoginView.setBounds(bounds)
      }
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && loginViewRef.current) {
      ro = new ResizeObserver(() => updateBounds())
      ro.observe(loginViewRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateBounds)
      ro?.disconnect()
    }
  }, [getLoginViewBounds, loading])

  useEffect(() => {
    return () => {
      window.api.authLoginView.close()
    }
  }, [])

  return (
    <>
      {loading ? (
        <>
          <div className="flex flex-col gap-3 items-center w-[min(960px,calc(100vw-64px))] h-[min(680px,calc(100vh-120px))]">
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <h1 className="text-slate-800 text-xl font-medium">{t('login.browserTitle')}</h1>
                <p className="text-slate-600 text-sm">{t('login.browserSubtitle')}</p>
              </div>
              <button
                onClick={closeLoginView}
                className="px-3 py-2 hover:bg-slate-100 text-slate-600 rounded-lg text-sm"
              >
                {t('login.retry')}
              </button>
            </div>
            <div
              ref={loginViewRef}
              className="w-full flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-slate-800 text-2xl font-medium">
            {t('login.titleLine1')} <br />
            {t('login.titleLine2')}
            <br />
            {t('login.titleLine3')}
          </h1>
          <button
            onClick={createSession}
            className="px-4 py-2 bg-blue-700 gap-1 cursor-pointer text-lg font-medium group rounded-lg hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300"
          >
            <span className="w-0 opacity-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto duration-300">
              <ArrowRight size={20}></ArrowRight>
            </span>
            {t('login.continueWithBrowser')}
          </button>
          <div className="flex items-center gap-1 text-xs">
            <p className="text-slate-600">
              {t('login.signupPrompt')}{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href={`${import.meta.env.VITE_SERVER_URL}/signup`}
                className="hover:underline text-blue-600"
              >
                {t('login.signupNow')}
              </a>
            </p>
          </div>
        </>
      )}
      <p className="absolute bottom-4 text-xs text-slate-600">{t('common.privacy')}</p>
    </>
  )
}
