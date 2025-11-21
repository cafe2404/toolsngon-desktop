/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ArrowLeft, ArrowRight, RotateCw, XIcon, Fingerprint, Home, BellIcon, Settings, LogOutIcon, LoaderCircle, Fullscreen, Cookie } from "lucide-react"
import { useProfiles } from "@renderer/contexts/ProfileContext"
import { useAuth } from "../contexts/AuthContext"
import { useCallback, useEffect, useState } from "react"
import logoSvg from '../assets/logo_2.svg'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@components/ui/dropdown-menu"
import { Notify } from "@/src/types/global"
import api from "../lib/axios"
import { usePanel } from "../contexts/PanelContext"

const TabControl = () => {
  const {
    currentProfile, currentTab, goBack, addTab,
    goForward, reload, stop, injectScript, switchTab, setCurrentProfile,
    toggleFullscreen
  } = useProfiles()
  const { togglePanel } = usePanel()
  const { loadUserProducts, user, appSetting, logout } = useAuth()
  const [notifications, setNotifications] = useState<Notify[] | null>()
  const [loadingNotify, setLoadingNotify] = useState(false)
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
  const handleToggleFullScreen = useCallback(() => {
    if (!currentTab) return
    toggleFullscreen(currentTab.id)
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
    if (!currentTab) return;
    injectScript(currentTab?.id, currentProfile.account.script)
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
  const getNotifications = async () => {
    setLoadingNotify(true)
    try {
      const fetchData = await api.get("/api/appdesktop/notifications/")
      setNotifications(fetchData.data)
    } catch {
      //
    } finally {
      setLoadingNotify(false)
    }
  }

  useEffect(() => {
  })
  if (!currentProfile) return <></>;
  return (
    <div className="flex flex-col">
      <div className="w-full flex items-center gap-2 pl-2 bg-white pr-3.5 py-1.5 border-b border-slate-200 rounded-t-2xl">
        <div className="flex items-center gap-1">
          <button onClick={handleSwitchToDashboard} className={`h-8 text-xs gap-1.5 rounded-lg text-slate-800 px-2 flex items-center justify-center hover:bg-slate-200 duration-300`}>
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
        <button disabled={currentTab?.id === '1'} onClick={togglePanel} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}>
          <Cookie size={16} />
        </button>
        <button disabled={currentTab?.id === '1'} onClick={handleToggleFullScreen} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}>
          <Fullscreen size={16} />
        </button>
      </div>
      {
        currentProfile.id !== '1' ?
          currentProfile?.account?.bookmarks &&
          <div className="w-full flex items-center gap-2 px-2 bg-white py-1.5 border-b border-slate-200">
            {currentProfile?.account?.bookmarks?.map(bookmark => (
              <button key={bookmark.url} onClick={() => handleAddNewTab(bookmark.url, bookmark.name)} className="py-1 px-2 h-7 text-xs cursor-pointer hover:bg-slate-200 duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center gap-2">
                {bookmark.name}
              </button>
            ))}
          </div>
          :
          <div className="w-full justify-between flex items-center gap-2 pl-2 pr-3.5 bg-white py-1.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              {appSetting && appSetting?.menus && appSetting.menus.map(item => (
                <>
                  <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="py-1 h-7 px-2 hover:bg-slate-200 duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center gap-2">
                    <div
                      dangerouslySetInnerHTML={{ __html: item.icon }}
                    />
                    <span className="text-xs">{item.label}</span>
                  </a>
                </>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <DropdownMenu onOpenChange={(open) => open && getNotifications()}>
                <DropdownMenuTrigger asChild disabled={loadingNotify} >
                  <div className={`${loadingNotify && 'pointer-events-none cursor-not-allowed'}size-7 hover:bg-slate-200 relative duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center justify-center`}>
                    {loadingNotify ?
                      <LoaderCircle className="animate-spin text-slate-800" size={16}></LoaderCircle>
                      :
                      <BellIcon size={16} />
                    }
                    {notifications && (
                      <div className="absolute -top-2 right-2 text-xs rounded-full size-4 flex items-center justify-center bg-red-500 text-white">
                        {notifications?.length}
                      </div>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 overflow-y-auto max-h-[70vh] rounded-xl p-0">
                  <DropdownMenuGroup className="divide-y">
                    {notifications ? notifications.map(noti => (
                      <DropdownMenuItem key={noti.id} className="rounded-none p-1 group">
                        <a href={noti.url} target="_blank" rel="noreferrer" className="flex flex-col gap-2 items-start p-2 hover:bg-slate-200 duration-150 rounded-lg">
                          <div className=" text-slate-800 font-medium text-left line-clamp-2">
                            {noti.title}
                            <span className="absolute top-4 right-4 p-2 rounded-md shadow bg-white opacity-0 group-hover:opacity-100 duration-150">
                              <ArrowRight size={14} className="text-slate-800 group-hover:-rotate-45 duration-300"></ArrowRight>
                            </span>
                          </div>
                          <span className="text-slate-600 text-xs line-clamp-3">
                            {noti.description}
                          </span>
                          {
                            noti.image &&
                            <div className="w-full aspect-video overflow-hidden rounded-md">
                              <img className="w-full h-full object-cover" src={noti.image} alt="" />
                            </div>
                          }
                        </a>
                      </DropdownMenuItem>
                    )) :

                      <DropdownMenuItem className="p-4 flex items-center justify-center">
                        Hiện không có thông báo
                      </DropdownMenuItem>
                    }
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`h-7 w-7 min-w-7 p-1 hover:bg-slate-200 rounded-md text-blue-50 flex items-center justify-center`}>
                    <div className='w-full flex aspect-square rounded-sm overflow-hidden focus:outline-none hover:bg-blue-800 text-blue-50  items-center justify-center'>
                      <img className="object-cover w-full h-full" src={user?.avatar_url} alt="" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <a href="http://toolsngon.com/settings/" target="_blank" rel="noreferrer">
                        <span className="flex items-center justify-center">
                          <Settings size={14} className="text-slate-800"></Settings>
                        </span>
                        Cài đặt
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} variant="destructive">
                      <span className="flex items-center justify-center">
                        <LogOutIcon size={14} className="text-red-600" />
                      </span>
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
      }
    </div>

  )
}
export default TabControl