/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Home, Loader2, Plus, XIcon } from "lucide-react"
import { useTabs } from "@contexts/TabContext"
import TabTitle from "./ui/TabTitle"
import { Reorder, motion } from "framer-motion";

const TabBar = () => {
    const { switchTab, tabs, currentTab, closeTab, setTabs } = useTabs();
    const externalTabs = tabs.filter((t) => t.type === "external");
    const internalTabs = tabs.filter((t) => t.type !== "external");

    const onReorder = (newOrder: typeof externalTabs): void => {
        const newTabs = [...internalTabs, ...newOrder];
        setTabs(newTabs);
    };

    const onWheelHorizontal = (e: React.WheelEvent<HTMLDivElement>): void => {
        const el = e.currentTarget;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            el.scrollLeft += e.deltaY;
        }
    };

    const handleMouseDown = (e: MouseEvent, tabId: string): void => {
        if (e.button === 1) {
            e.stopPropagation();
            closeTab(tabId);
        }
    };
    const handleOpenExternalUrl = (url: string) => {
        window.api?.browserView?.navigate(currentTab.id, url)
    }
    const handleOpenHome = () => {
        if (!currentTab?.url) return
        window.api?.browserView?.navigate(currentTab.id, currentTab?.url)
    }
    return (
        <div className='flex items-center gap-1.5 w-full py-1.5 bg-slate-200 navbar px-2'>
            {currentTab.id !== "1" ?
                <>
                    <button onClick={handleOpenHome} className={`w-8 h-8 flex rounded-lg bg-white hover:bg-slate-200 duration-150 items-center justify-center`}>
                        <Home size={16}></Home>
                    </button>
                    <div className="no-scrollbar no-drag" onWheel={onWheelHorizontal}>
                        <Reorder.Group
                            layout="position"
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 30,
                            }}
                            axis="x"
                            values={externalTabs}
                            onReorder={onReorder}
                            className="flex gap-1.5"
                        >
                            {externalTabs.map((tab) => (
                                <Reorder.Item
                                    value={tab}
                                    key={tab.id}
                                    onMouseDown={(e) => handleMouseDown(e, tab.id)}
                                    onPointerDown={() => switchTab(tab.id)}
                                    layout
                                    className={`relative ${currentTab.id === tab.id
                                        ? "bg-white "
                                        : "hover:bg-slate-200 duration-150"
                                        } rounded-lg p-2 max-w-44`}
                                >
                                    <motion.div
                                        layout
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="h-full relative z-1 flex items-center justify-between rounded-lg gap-4 w-full">
                                            <div className="flex items-center gap-2 text-xs">
                                                {tab.isLoading ? (
                                                    <Loader2 className="size-4 min-w-4 animate-spin" />
                                                ) : (
                                                    <img
                                                        className="size-4 min-w-4 rounded-full object-cover"
                                                        src={tab.favicon}
                                                        alt=""
                                                    />
                                                )}
                                                <motion.span
                                                    initial={false}
                                                    className="line-clamp-1 text-left overflow-hidden"
                                                >
                                                    {tab.title}
                                                </motion.span>
                                            </div>
                                            <motion.button
                                                initial={false}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeTab(tab.id);
                                                }}
                                                className="flex hover:bg-slate-200 items-center justify-center min-w-4 size-4 rounded-full duration-300"
                                            >
                                                <XIcon size={14} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                    {currentTab.account?.external_urls && currentTab.account?.external_urls?.length > 0 && currentTab.account?.external_urls?.map((url) => (
                        <button key={url.url} onClick={() => handleOpenExternalUrl(url.url)} className={`px-2 h-8 gap-1 rounded-lg text-slate-800 flex items-center justify-center duration-300 hover:bg-slate-200`}>
                            <span className="text-xs">{url.name}</span>
                        </button>
                    ))}
                    <button className={`w-8 h-8 flex rounded-lg hover:bg-slate-300 duration-150 items-center justify-center`}>
                        <Plus size={16}></Plus>
                    </button>
                </>
                :
                <TabTitle />
            }
        </div>
    )
}
export default TabBar