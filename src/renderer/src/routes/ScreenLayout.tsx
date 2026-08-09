/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Outlet } from 'react-router-dom'
import { Toaster } from '@components/ui/sonner'
import { useLanguage } from '../contexts/LanguageContext'

const ScreenLayout = () => {
  const { t } = useLanguage()

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white text-center relative">
      <div className="absolute top-0 left-0 w-full pr-36">
        <div className="w-full h-10 navbar"></div>
      </div>

      <div className="flex flex-col gap-6 items-center justify-center h-full">
        <Outlet />
      </div>
      <p className="absolute bottom-4 text-xs text-slate-600">{t('common.privacy')}</p>
      <Toaster position="top-center" />
    </div>
  )
}

export default ScreenLayout
