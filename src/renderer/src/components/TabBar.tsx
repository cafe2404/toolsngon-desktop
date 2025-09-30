/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Ellipsis, ListOrdered, ArrowLeft, ArrowRight, RotateCw, XIcon, Columns, ScanFace } from "lucide-react"
import Tablist from "@components/Tablist"
import { useTabs } from "@contexts/TabContext"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip"

const Navbar = () => {
  const { currentTab, goBack, goForward, reload, stop, toggleSplit, splitTabs, clearSplit, injectScript } = useTabs()
  const handleReloadTab = async () => {
    await reload(currentTab.id)
  }
  const handleInjectScript = () => {
    console.log(currentTab?.pendingScript)
    if (currentTab?.pendingScript) {
      injectScript(currentTab.id, currentTab?.pendingScript)
    }
  }
  return (
    <div className='navbar w-full flex-col flex bg-slate-200 border-b border-b-slate-200'>
      <Tablist></Tablist>
      <div className='flex gap-1.5 py-1.5 flex-col w-full px-2 bg-white rounded-t-xl' >
        <div className="w-full flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => goBack(currentTab.id)} disabled={!currentTab.canGoBack} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.canGoBack ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}>
                  <ArrowLeft size={16}></ArrowLeft>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quay lại</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => goForward(currentTab.id)} disabled={!currentTab.canGoForward} className={`h-8 w-8 min-w-8 rounded-lg text-slate-800 flex items-center justify-center duration-300 ${currentTab.canGoForward ? 'hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}>
                  <ArrowRight size={16}></ArrowRight>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đi tới</p>
              </TooltipContent>
            </Tooltip>


            {currentTab.isLoading ? (

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => stop(currentTab.id)} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
                    <XIcon size={16}></XIcon>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dừng tải lại</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleReloadTab} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
                    <RotateCw size={16}></RotateCw>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tải lại trang</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleInjectScript} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
                  <ScanFace size={16}></ScanFace>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đăng nhập lại</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="relative bg-slate-100 w-full h-8 rounded-lg gap-1 no-drag flex items-center px-1 py-1">
              <button className='px-2 py-0.5 h-full rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
                <ListOrdered size={16}></ListOrdered>
              </button>
              <input readOnly type="text" className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2" value={currentTab.currentUrl ?? 'https://www.toolsngon.com'} name="" id="" />
            </div>
          </div>
          <button onClick={() => splitTabs ? clearSplit() : toggleSplit()} title={splitTabs ? 'Thoát split view' : 'Bật split view'} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
            <Columns size={16} />
          </button>
          <button className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
            <Ellipsis size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
export default Navbar