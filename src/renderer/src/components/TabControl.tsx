/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ArrowLeft, ArrowRight, RotateCw, XIcon, ScanFace, LayoutGrid, Store, LogOut, CircleQuestionMark } from "lucide-react"
import { useTabs } from "@contexts/TabContext"
import { useAuth } from "../contexts/AuthContext"

const TabControl = () => {
  const { currentTab, goBack, goForward, addTab, reload, stop, injectScript, switchTab } = useTabs()
  const { loadUserProducts, user, logout } = useAuth()
  const handleReloadTab = async () => {
    if (currentTab.id === '1') {
      await loadUserProducts()
      return
    }
    await reload(currentTab.id)
  }
  const handleInjectScript = async () => {
    if (currentTab?.account) {
      injectScript(currentTab.id, currentTab?.account)
    }
  }
  return (
    <div className="w-full flex items-center gap-2 pl-2 bg-white pr-3.5 py-1.5 border-b border-slate-200 rounded-t-2xl">
      <div className="flex items-center gap-1">
        <button onClick={() => goBack(currentTab.id)} disabled={!currentTab.canGoBack} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.canGoBack ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}>
          <ArrowLeft size={16}></ArrowLeft>
        </button>
        <button onClick={() => goForward(currentTab.id)} disabled={!currentTab.canGoForward} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.canGoForward ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}>
          <ArrowRight size={16}></ArrowRight>
        </button>
        {currentTab.isLoading ? (
          <button onClick={() => stop(currentTab.id)} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
            <XIcon size={16}></XIcon>
          </button>
        ) : (

          <button onClick={handleReloadTab} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
            <RotateCw size={16}></RotateCw>
          </button>
        )}

        <button disabled={currentTab.id === '1'} onClick={handleInjectScript} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.id !== '1' ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'} `}>
          <ScanFace size={16}></ScanFace>
        </button>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="relative bg-slate-100 w-full h-8 rounded-lg gap-1 no-drag flex items-center px-4 py-1">
          <input readOnly type="text" className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2" value={currentTab.currentUrl ?? 'https://www.toolsngon.com'} name="" id="" />
        </div>
      </div>
      <button onClick={() => switchTab("1")} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.id === '1' ? 'bg-slate-200' : 'hover:bg-slate-200'}`}>
        <LayoutGrid size={16}></LayoutGrid>
      </button>
      <button onClick={async () => {
        await addTab({
          id: "2",
          name: 'introduction',
          title: 'Hướng dẫn',
          type: 'external',
          url: 'https://toolsngon.com/page/introduction',
          currentUrl: 'https://toolsngon.com/page/introduction',
        })
      }} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.id === '2' ? 'bg-slate-200' : 'hover:bg-slate-200'}`}>
        <CircleQuestionMark size={16}></CircleQuestionMark>
      </button>
      <a href="https://toolsngon.com/store/" target="_blank" rel="noreferrer" className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 hover:bg-slate-200`}>
        <Store size={16}></Store>
      </a>
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