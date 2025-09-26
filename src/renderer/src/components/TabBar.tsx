/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Ellipsis, ListOrdered, ArrowLeft, ArrowRight, RotateCw, XIcon } from "lucide-react"
import Tablist from "@components/Tablist"
import { useTabs } from "@contexts/TabContext"
const Navbar = () => {
  const { currentTab, goBack, goForward, reload, stop } = useTabs()
  return (
    <div className='navbar w-full flex-col flex bg-slate-200 border-b border-b-slate-200'>
      <Tablist></Tablist>
      <div className='flex gap-2 py-2 w-full px-2 bg-white rounded-t-xl' >
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
            <button onClick={() => reload(currentTab.id)} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
              <RotateCw size={16}></RotateCw>
            </button>
          )}
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="relative bg-slate-100 w-full h-8 rounded-lg gap-1 no-drag flex items-center px-1 py-1">
            <button className='px-2 py-0.5 h-full rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
              <ListOrdered size={16}></ListOrdered>
            </button>
            <input readOnly type="text" className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2" value={currentTab.currentUrl ?? 'https://www.toolsngon.com'} name="" id="" />
          </div>
        </div>
        <button className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
          <Ellipsis size={16} />
        </button>
      </div>
    </div>
  )
}
export default Navbar