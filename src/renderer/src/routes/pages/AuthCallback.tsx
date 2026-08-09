/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { loginWithCode, loginWithDesktopToken } = useAuth()
  const { t } = useLanguage()

  const checkAuth = async (): Promise<void> => {
    try {
      if (token) {
        await loginWithDesktopToken(token)
      } else {
        await loginWithCode({
          session_id: sessionId!,
          code: code!
        })
      }
      navigate('/dashboard')
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
      navigate('/login')
    }
  }

  useEffect(() => {
    console.log(code, sessionId, token)
    if (token || (code && sessionId)) {
      void checkAuth()
    }
  }, [code, sessionId, token])

  return (
    <>
      <h1 className="font-medium text-slate-800">{t('common.loading')}</h1>
      <LoaderCircle className="animate-spin  text-slate-800" size={20}></LoaderCircle>
    </>
  )
}
