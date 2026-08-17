/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@renderer/lib/axios'
import { useAuth } from '@contexts/AuthContext'
import { toast } from 'sonner'
import { useLanguage } from '@renderer/contexts/LanguageContext'
import { desktop } from '@renderer/lib/desktop'
import { SERVER_URL } from '@renderer/lib/server'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loginUrl, setLoginUrl] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const createSession = async () => {
    try {
      setLoading(true)
      const res = await api.post('/api/app_auth/create_session/')
      const session_id = res.data.session_id
      const nextLoginUrl = `${SERVER_URL}/app_auth/${session_id}/grant/`
      setLoginUrl(nextLoginUrl)
      await desktop.app.openExternal(nextLoginUrl)
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
    const unsubscribe = desktop.events.onDeepLink((url) => {
      const parsed = new URL(url)
      if (parsed.host === 'auth') {
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

  return (
    <>
      {loading ? (
        <>
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <LoaderCircle className="animate-spin text-blue-700" size={28} />
            <div>
              <h1 className="text-xl font-medium text-slate-800">{t('login.browserTitle')}</h1>
              <p className="mt-1 text-sm text-slate-600">{t('login.browserSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>{t('login.retryPrompt')}</span>
              <button
                type="button"
                onClick={() => loginUrl && desktop.app.openExternal(loginUrl)}
                disabled={!loginUrl}
                className="font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('login.retry')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-slate-800 text-3xl font-bold">
            {t('login.titleLine1')}
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
                href={`${SERVER_URL}/signup`}
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
