/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ArrowLeft, ArrowRight, RotateCw, XIcon, ScanFace, LayoutGrid, Store, LogOut, CircleQuestionMark } from "lucide-react"
import { useProfiles } from "@renderer/contexts/ProfileContext"
import { useAuth } from "../contexts/AuthContext"
import { useEffect, useState } from "react"

const TabControl = () => {
  const { currentProfile, currentTab, goBack, goForward, addTab, reload, stop, injectScript, switchTab, setCurrentProfile, profiles } = useProfiles()
  const { loadUserProducts, user, logout } = useAuth()
  const [url, setUrl] = useState(currentTab?.currentUrl)
  useEffect(() => {
    if (currentTab?.currentUrl !== url) {
      setUrl(currentTab?.currentUrl)
    }
  }, [currentTab?.currentUrl])

  if (!currentProfile) return <></>;
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
    if (currentTab.id === '1' && currentProfile.id === '1') {
      await loadUserProducts()
      return
    }
    await reload(currentTab.id)
  }
  const handleInjectScript = async () => {
    if (!currentTab?.account?.script) return;
    injectScript(currentTab.id, currentTab.account.script)
  }

  const handleSwitchToDashboard = async () => {
    if (currentTab?.id !== '1') {
      setCurrentProfile("1")
      await new Promise(resolve => setTimeout(resolve, 10))
      switchTab("1", "1")
      await loadUserProducts()
    }
  }

  const handleAddIntroductionTab = async () => {
    setCurrentProfile("1")
    await new Promise(resolve => setTimeout(resolve, 10))
    const profile1 = profiles.find(p => p.id === "1")
    const existingIntroductionTab = profile1?.tabs.find(tab => tab.id === "2")

    if (existingIntroductionTab) {
      switchTab("1", "2")
    } else {
      await addTab("1", {
        id: "2",
        name: 'introduction',
        title: 'Hướng dẫn',
        url: 'https://toolsngon.com/page/introduction',
        currentUrl: 'https://toolsngon.com/page/introduction',
      })
    }
  }
  const handleAddStoreTab = async () => {
    setCurrentProfile("1")
    await new Promise(resolve => setTimeout(resolve, 10))
    const profile1 = profiles.find(p => p.id === "1")
    const existingIntroductionTab = profile1?.tabs.find(tab => tab.id === "3")

    if (existingIntroductionTab) {
      switchTab("1", "3")
    } else {
      await addTab("1", {
        id: "3",
        name: 'Cửa hàng',
        title: 'Cửa hàng',
        url: 'https://toolsngon.com/store',
        currentUrl: 'https://toolsngon.com/store',
      })
    }
  }

  return (
    <div className="w-full flex items-center gap-2 pl-2 bg-white pr-3.5 py-1.5 border-b border-slate-200 rounded-t-2xl">
      <div className="flex items-center gap-1">
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

        <button disabled={currentTab?.id === '1'} onClick={handleInjectScript} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}>
          <ScanFace size={16}></ScanFace>
        </button>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="relative focus-within:border-blue-500 border-2 border-slate-200 bg-slate-200 w-full h-8 rounded-lg gap-1 no-drag flex items-center px-4 py-1">
          <input readOnly={currentProfile.id === '1' || !currentTab?.account?.is_edit_omnibox} type="text" onKeyDown={handleKeyDown} className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2" value={url} onChange={(e) => setUrl(e.target.value)} name="" id="" />
        </div>
      </div>
      <button onClick={handleSwitchToDashboard} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id === '1' ? 'bg-slate-200' : 'hover:bg-slate-200'}`}>
        <LayoutGrid size={16}></LayoutGrid>
      </button>
      <button onClick={handleAddIntroductionTab} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id === '2' ? 'bg-slate-200' : 'hover:bg-slate-200'}`}>
        <CircleQuestionMark size={16}></CircleQuestionMark>
      </button>
      <button onClick={handleAddStoreTab} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab?.id === '3' ? 'bg-slate-200' : 'hover:bg-slate-200'}`}>
        <Store size={16}></Store>
      </button>
      <button onClick={logout} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 hover:bg-slate-200`}>
        <LogOut size={16}></LogOut>
      </button>
      <a href='https://toolsngon.com/settings' target='_blank' rel="noreferrer" className={`h-6 w-6 min-w-6 rounded-md text-blue-50 flex items-center justify-center`}>
        <div className='w-full flex aspect-square rounded-full overflow-hidden focus:outline-none hover:bg-blue-800 text-blue-50  items-center justify-center'>
          <img className="object-cover w-full h-full" src={user?.avatar_url} alt="" />
        </div>
      </a>
    </div>
  )
}
export default TabControl