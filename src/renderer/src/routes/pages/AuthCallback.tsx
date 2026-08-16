/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth } from '@contexts/AuthContext'
import { LoaderCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useLanguage } from '@renderer/contexts/LanguageContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const sessionId = searchParams.get('session_id')
  const navigate = useNavigate()
  const { loginWithCode } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (!code || !sessionId) return

    let active = true
    const exchangeCode = async (): Promise<void> => {
      try {
        await loginWithCode({ session_id: sessionId, code })
        if (active) navigate('/dashboard')
      } catch (err: any) {
        if (!active) return
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
        navigate('/login')
      }
    }

    void exchangeCode()
    return () => {
      active = false
    }
  }, [code, loginWithCode, navigate, sessionId, t])

  return (
    <>
      <h1 className="font-medium text-slate-800">{t('common.loading')}</h1>
      <LoaderCircle className="animate-spin  text-slate-800" size={20}></LoaderCircle>
    </>
  )
}
