import { ChevronDown, Loader2, XIcon } from 'lucide-react';
import { useTabs } from '../contexts/TabContext';

const Tablist = (): React.JSX.Element => {
    const { switchTab, tabs, currentTab, closeTab } = useTabs()
    return (
        <div className="h-10 pr-36 flex items-center gap-1.5 pl-1.5">
            <button className="h-7 w-7 min-w-7 relative z-10 bg-white rounded-lg hover:bg-blue-200 text-slate-800 flex items-center justify-center duration-300">
                <ChevronDown size={16} />
            </button>
            {tabs.map((tab) => (
                tab.type === "external" && (
                    <div className="pt-1.5 h-full" key={tab.id}>
                        <div className={`h-full rounded-t-xl pb-1.5 relative ${currentTab.id === tab.id && "bg-white"}`} >
                            <button onClick={() => switchTab(tab.id)} className={`h-full relative z-20 px-2 flex items-center justify-between rounded-lg gap-4 w-[180px] ${currentTab.id !== tab.id && "hover:bg-slate-300 duration-150"}`}>
                                <div className="flex items-center gap-2 text-xs">
                                    {tab.isLoading ? (
                                        <Loader2 className="size-4 min-w-4 animate-spin" />
                                    ) : (
                                        <img className="size-4 min-w-4 rounded-full object-cover" src={tab.favicon} alt="" />
                                    )}
                                    <span className="line-clamp-1 text-left">{tab.title}</span>
                                </div>
                                <div onClick={(e)=>{ e.stopPropagation(); closeTab(tab.id); }} className="flex items-center justify-center min-w-4 size-4 rounded-full hover:bg-slate-200 duration-300">
                                    <XIcon size={14} />
                                </div>
                            </button>
                            <div className='' style={{display: currentTab.id === tab.id ? "block" : "none"}}>
                                <div className="absolute bottom-0 -left-4 w-4 h-4 bg-white overflow-hidden z-0">
                                    <div className="absolute w-6 h-6 rounded-xl bg-slate-200 -top-2 -left-2"></div>
                                </div>
                                <div className="absolute bottom-0 -right-4 w-4 h-4 bg-white overflow-hidden z-0">
                                    <div className="absolute w-6 h-6 rounded-xl bg-slate-200 -top-2 -right-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}

export default Tablist;
