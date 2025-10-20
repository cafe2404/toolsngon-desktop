/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ArrowLeft, ArrowRight, RotateCw, XIcon, Fingerprint, Home } from "lucide-react"
import { useProfiles } from "@renderer/contexts/ProfileContext"
import { useAuth } from "../contexts/AuthContext"
import { useCallback, useEffect, useState } from "react"
import logoSvg from '../assets/logo_2.svg'

const TabControl = () => {
  const { currentProfile, currentTab, goBack, addTab, goForward, reload, stop, injectScript, switchTab, setCurrentProfile } = useProfiles()
  const { loadUserProducts, user, appSetting } = useAuth()

  const [url, setUrl] = useState(currentTab?.currentUrl)
  useEffect(() => {
    if (currentTab?.currentUrl !== url) {
      setUrl(currentTab?.currentUrl)
    }
  }, [currentTab?.currentUrl])

  const handleOpenHome = useCallback(() => {
    if (!currentTab?.url) return
    window.api?.browserView?.navigate(currentTab.id, currentTab?.url)
  }, [currentTab]);
  const handleSwitchToDashboard = async () => {
    if (currentProfile?.id !== '1') {
      setCurrentProfile("1")
      switchTab("1", "1")
      await loadUserProducts();
    }
  }
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && url?.trim() && currentTab?.id) {
      let input = url.trim()
      let targetUrl = ""

      // Kiểm tra xem người dùng nhập có phải là URL không
      const isProbablyUrl = /^(https?:\/\/|www\.)|(\.[a-z]{2,})(\/|$)/i.test(input)

      if (isProbablyUrl) {
        // Nếu thiếu https:// thì thêm vào
        if (!/^https?:\/\//i.test(input)) {
          input = "https://" + input
        }
        targetUrl = input
      } else {
        // Không phải URL → search Google
        const encoded = encodeURIComponent(input)
        targetUrl = `https://www.google.com/search?q=${encoded}`
      }

      // Gọi API để điều hướng trong BrowserView
      await window.api.browserView?.navigate(currentTab.id, targetUrl)
    }
  }
  const handleReloadTab = async () => {
    if (!currentTab) return;
    if (currentTab.id === '1' && currentProfile?.id === '1') {
      await loadUserProducts()
      return
    }
    await reload(currentTab.id)
  }
  const handleInjectScript = async () => {
    if (!currentProfile?.account?.script) return;
    injectScript(currentProfile.id, currentProfile.account.script)
  }
  const handleAddNewTab = useCallback((url, title) => {
    if (!currentProfile) return;
    const newTabId = `tab_${Date.now()}`
    const newTab = {
      id: newTabId,
      name: title,
      title: title,
      url: url,
      currentUrl: url,
      favicon: 'https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=' + url
    }
    addTab(currentProfile.id, newTab)

  }, [currentProfile, addTab]);
  if (!currentProfile) return <></>;
  return (
    <div className="flex flex-col">
      <div className="w-full flex items-center gap-2 pl-2 bg-white pr-3.5 py-1.5 border-b border-slate-200 rounded-t-2xl">
        <div className="flex items-center gap-1">
          <button onClick={handleSwitchToDashboard} className={`h-8 text-xs gap-1.5 rounded-lg text-slate-800 px-2 flex items-center justify-center hover:bg-slate-300 duration-300`}>
            <img className="size-4 min-w-4 object-cover" src={logoSvg}></img>
            Dashboard
          </button>
          <button onClick={() => currentTab && goBack(currentTab.id)} disabled={!currentTab?.canGoBack} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.canGoBack ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}>
            <ArrowLeft size={16}></ArrowLeft>
          </button>
          <button onClick={() => currentTab && goForward(currentTab.id)} disabled={!currentTab?.canGoForward} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.canGoForward ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}>
            <ArrowRight size={16}></ArrowRight>
          </button>
          {currentTab?.isLoading ? (
            <button onClick={() => currentTab && stop(currentTab.id)} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
              <XIcon size={16}></XIcon>
            </button>
          ) : (

            <button onClick={handleReloadTab} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
              <RotateCw size={16}></RotateCw>
            </button>
          )}
          <button disabled={currentTab?.id === '1'} onClick={handleOpenHome} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}>
            <Home size={16}></Home>
          </button>
          <button disabled={currentTab?.id === '1'} onClick={handleInjectScript} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}>
            <Fingerprint size={16}></Fingerprint>
          </button>
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="relative focus-within:border-blue-500 border-2 border-slate-200 bg-slate-200 w-full h-8 rounded-lg gap-1 no-drag flex items-center px-4 py-1">
            <input readOnly={currentProfile.id === '1' || !currentProfile?.account?.is_edit_omnibox} type="text" onKeyDown={handleKeyDown} className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2" value={url} onChange={(e) => setUrl(e.target.value)} name="" id="" />
          </div>
        </div>

      </div>
      {
        currentProfile.id !== '1' ?
          currentProfile?.account?.bookmarks &&
          <div className="w-full flex items-center gap-2 px-2 bg-white py-1.5 border-b border-slate-200">
            {currentProfile?.account?.bookmarks?.map(bookmark => (
              <button key={bookmark.url} onClick={() => handleAddNewTab(bookmark.url, bookmark.name)} className="py-1 px-2 h-6 text-xs cursor-pointer hover:bg-slate-200 duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center gap-2">
                {bookmark.name}
              </button>
            ))}
          </div>
          :
          <div className="w-full justify-between flex items-center gap-2 pl-2 pr-3.5 bg-white py-1.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              {appSetting && appSetting?.menus && appSetting.menus.map(item => (
                <>
                  <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="py-1 h-6 px-2 hover:bg-slate-200 duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center gap-2">
                    <div
                      dangerouslySetInnerHTML={{ __html: item.icon }}
                    />
                    <span className="text-xs">{item.label}</span>
                  </a>
                  <div className="w-px h-4 bg-slate-200"></div>
                </>
              ))}
            </div>
            <a href='https://toolsngon.com/settings' target='_blank' rel="noreferrer" className={`ml-1 h-6 w-6 min-w-6 rounded-md text-blue-50 flex items-center justify-center`}>
              <div className='w-full flex aspect-square rounded-full overflow-hidden focus:outline-none hover:bg-blue-800 text-blue-50  items-center justify-center'>
                <img className="object-cover w-full h-full" src={user?.avatar_url} alt="" />
              </div>
            </a>
          </div>
      }
    </div>

  )
}
export default TabControl