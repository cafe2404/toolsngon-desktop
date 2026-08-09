/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  XIcon,
  Home,
  CookieIcon,
  BracesIcon,
  Sparkles
} from 'lucide-react'
import { useProfiles } from '@renderer/contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import { useCallback, useEffect, useState } from 'react'
import { usePanel } from '../contexts/PanelContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { getDesktopWebLoginUrl } from '../lib/desktopWebLogin'
import { desktop } from '@renderer/lib/desktop'

const TabControl = () => {
  const { currentProfile, currentTab, goBack, addTab, goForward, reload, stop, injectScript } =
    useProfiles()
  const { togglePanel } = usePanel()
  const { loadUserProducts } = useAuth()
  const { t } = useLanguage()
  const [url, setUrl] = useState(currentTab?.currentUrl)
  useEffect(() => {
    if (currentTab?.currentUrl !== url) {
      setUrl(currentTab?.currentUrl)
    }
  }, [currentTab?.currentUrl])

  const handleOpenHome = useCallback(() => {
    if (!currentTab?.url) return
    desktop.browser.tabs.navigate(currentTab.id, currentTab?.url)
  }, [currentTab])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url?.trim() && currentTab?.id) {
      let input = url.trim()
      let targetUrl = ''

      // Kiểm tra xem người dùng nhập có phải là URL không
      const isProbablyUrl = /^(https?:\/\/|www\.)|(\.[a-z]{2,})(\/|$)/i.test(input)

      if (isProbablyUrl) {
        // Nếu thiếu https:// thì thêm vào
        if (!/^https?:\/\//i.test(input)) {
          input = 'https://' + input
        }
        targetUrl = input
      } else {
        // Không phải URL → search Google
        const encoded = encodeURIComponent(input)
        targetUrl = `https://www.google.com/search?q=${encoded}`
      }

      // Gọi API để điều hướng trong BrowserView
      const nextUrl = await getDesktopWebLoginUrl(targetUrl)
      await desktop.browser.tabs.navigate(currentTab.id, nextUrl || targetUrl)
    }
  }
  const handleReloadTab = async () => {
    if (!currentTab) return
    if (currentTab.id === '1' && currentProfile?.id === '1') {
      await loadUserProducts()
      return
    }
    await reload(currentTab.id)
  }
  const handleInjectScript = async () => {
    if (!currentProfile?.account?.script) return
    if (!currentTab) return
    injectScript(currentTab?.id, currentProfile.account.script)
  }
  const handleSetCookies = useCallback(async () => {
    if (!currentProfile?.account?.cookies) return
    if (!currentTab) return
    await desktop.browser.tabs.setCookies(currentTab.id, currentProfile.account.cookies)
  }, [currentProfile, currentTab])

  const handleAddNewTab = useCallback(
    (url, title) => {
      if (!currentProfile) return
      const newTabId = `tab_${Date.now()}`
      const newTab = {
        id: newTabId,
        name: title,
        title: title,
        url: url,
        currentUrl: url,
        favicon:
          'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=' +
          url
      }
      addTab(currentProfile.id, newTab)
    },
    [currentProfile, addTab]
  )

  if (!currentProfile) return <></>
  const bookmarks = currentProfile.account?.bookmarks || []
  const extensionPartition = `persist:profile-${currentProfile.id}`
  const extensionTab = currentTab?.webContentsId ? String(currentTab.webContentsId) : undefined
  return (
    <div className={cn('flex flex-col bg-white')}>
      <div
        className={cn(
          'w-full flex items-center gap-2 pl-2 pr-2 py-1.5 border-b border-slate-200',
          !currentProfile.account?.is_create_tab && 'navbar pr-36'
        )}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => currentTab && goBack(currentTab.id)}
            disabled={!currentTab?.canGoBack}
            className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.canGoBack ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}
          >
            <ArrowLeft size={16}></ArrowLeft>
          </button>
          <button
            onClick={() => currentTab && goForward(currentTab.id)}
            disabled={!currentTab?.canGoForward}
            className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.canGoForward ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}
          >
            <ArrowRight size={16}></ArrowRight>
          </button>
          {currentTab?.isLoading ? (
            <button
              onClick={() => currentTab && stop(currentTab.id)}
              className="h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300"
            >
              <XIcon size={16}></XIcon>
            </button>
          ) : (
            <button
              onClick={handleReloadTab}
              className="h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300"
            >
              <RotateCw size={16}></RotateCw>
            </button>
          )}
          <button
            disabled={currentTab?.id === '1'}
            onClick={handleOpenHome}
            className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}
          >
            <Home size={16}></Home>
          </button>
          {currentProfile?.account?.script && (
            <button
              disabled={currentTab?.id === '1'}
              onClick={handleInjectScript}
              className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}
            >
              <BracesIcon size={16}></BracesIcon>
            </button>
          )}
          {currentProfile?.account?.cookies && (
            <button
              disabled={currentTab?.id === '1'}
              onClick={handleSetCookies}
              className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}
            >
              <CookieIcon size={16}></CookieIcon>
            </button>
          )}
        </div>
        <div className="w-full flex items-center justify-center group">
          <div className="relative focus-within:border-blue-500 border-2 border-slate-100 bg-slate-100 w-full h-8 rounded-lg gap-1 no-drag flex items-center px-4 py-1">
            <input
              readOnly={currentProfile.id === '1' || !currentProfile?.account?.is_edit_omnibox}
              type="text"
              onKeyDown={handleKeyDown}
              className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <div className="absolute h-8 font-medium rounded-lg gap-2 bg-slate-100 left-0 right-4 flex items-center px-1.5 text-sm text-slate-600 pointer-events-none group-focus-within:hidden">
              {currentTab?.favicon && (
                <img src={currentTab.favicon} alt="" className="size-5 rounded-sm" />
              )}
              {currentTab?.title}
            </div>
            {currentProfile.id !== '1' && extensionTab && (
              <browser-action-list
                className="size-9 flex items-center absolute top-1/2 -translate-y-1/2 -right-1.5"
                partition={extensionPartition}
                tab={extensionTab}
                alignment="bottom left"
              />
            )}
          </div>
        </div>
        <Button
          onClick={() => togglePanel('chat')}
          variant="secondary"
          className={`support-chat-button h-8 bg-slate-50 hover:bg-white px-2.5 text-xs whitespace-nowrap text-slate-800 font-semibold`}
        >
          <Sparkles className="fill-blue-600 stroke-blue-500 stroke-1" size={16} />
          {t('supportChat.supportChat')}
        </Button>
      </div>
      {currentProfile.id !== '1' && bookmarks.length > 0 && (
        <div className="w-full flex items-center gap-2 px-2 bg-white py-1.5 border-b border-slate-200">
          {bookmarks.map((bookmark) => (
            <button
              key={bookmark.url}
              onClick={() => handleAddNewTab(bookmark.url, bookmark.name)}
              className="py-1 px-2 h-7 text-xs cursor-pointer hover:bg-slate-200 duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center gap-2"
            >
              {bookmark.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
export default TabControl
