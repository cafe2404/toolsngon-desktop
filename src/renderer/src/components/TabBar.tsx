/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Home, Loader2, Plus, XIcon } from "lucide-react"
import { useProfiles } from "@renderer/contexts/ProfileContext"
import TabTitle from "./ui/TabTitle"
import { Reorder, motion } from "framer-motion";
import React, { useMemo, useCallback } from "react";

const TabBar = () => {
    const { switchTab, currentProfile, currentTab, closeTab, updateProfile, addTab } = useProfiles();

    // Memoize tabs to prevent unnecessary re-renders
    const allTabs = useMemo(() => currentProfile?.tabs || [], [currentProfile?.tabs]);

    const onReorder = useCallback((newOrder: typeof allTabs): void => {
        if (!currentProfile) return;
        // Update the current profile with new tab order
        updateProfile(currentProfile.id, { tabs: newOrder });
    }, [currentProfile, updateProfile]);

    const onWheelHorizontal = useCallback((e: React.WheelEvent<HTMLDivElement>): void => {
        const el = e.currentTarget;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            el.scrollLeft += e.deltaY;
        }
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent, tabId: string): void => {
        if (!currentProfile) return;
        if (e.button === 1) {
            e.stopPropagation();
            closeTab(currentProfile.id, tabId);
        }
    }, [currentProfile, closeTab]);


    const handleOpenHome = useCallback(() => {
        if (!currentTab?.url) return
        window.api?.browserView?.navigate(currentTab.id, currentTab?.url)
    }, [currentTab]);

    const handleAddNewTab = useCallback(() => {
        if (!currentProfile) return;
        // Add a new empty tab
        const newTabId = `tab_${Date.now()}`
        const newTab = {
            id: newTabId,
            name: 'new-tab',
            title: 'Tab mới',
            url: 'https://www.google.com',
            currentUrl: 'https://www.google.com',
            favicon: 'https://www.google.com/favicon.ico'
        }
        addTab(currentProfile.id, newTab)
    }, [currentProfile, addTab]);

    if (!currentProfile) return <></>;
    return (
        <div className='flex items-center gap-1.5 w-full py-1.5 bg-slate-200 navbar px-2'>
            {/* Always show tabs if there are any tabs in the profile */}
            {allTabs.length > 0 ? (
                <>
                    <button onClick={handleOpenHome} className={`w-8 h-8 flex rounded-lg bg-white hover:bg-slate-300 duration-150 items-center justify-center`}>
                        <Home size={16}></Home>
                    </button>
                    <div className="no-scrollbar w-full" onWheel={onWheelHorizontal}>
                        <Reorder.Group
                            layout="position"
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 30,
                            }}
                            axis="x"
                            values={allTabs}
                            onReorder={onReorder}
                            className="flex gap-1.5"
                        >
                            {allTabs.map((tab) => (
                                <Reorder.Item
                                    value={tab}
                                    key={tab.id}
                                    onMouseDown={(e: React.MouseEvent) => handleMouseDown(e.nativeEvent, tab.id)}
                                    onPointerDown={() => switchTab(currentProfile.id, tab.id)}
                                    layout
                                    className={`relative ${currentTab && currentTab.id === tab.id
                                        ? "bg-white "
                                        : "hover:bg-slate-200 duration-150"
                                        } rounded-lg p-2 w-full max-w-44 no-drag`}
                                >
                                    <motion.div
                                        layout
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="h-full relative z-1 flex items-center justify-between w-full rounded-lg gap-2 overflow-hidden">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {tab.isLoading ? (
                                                    <Loader2 className="size-4 min-w-4 animate-spin" />
                                                ) : (
                                                    <img
                                                        className="size-4 min-w-4 object-cover rounded-sm"
                                                        src={tab.favicon}
                                                        alt=""
                                                    />
                                                )}
                                                <div className="truncate text-left text-xs w-full">
                                                    {tab.title}
                                                </div>
                                            </div>
                                            {allTabs.length > 1 && tab.id !== '1' &&
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        closeTab(currentProfile.id, tab.id);
                                                    }}
                                                    className="flex hover:bg-slate-200 items-center justify-center min-w-4 size-4 rounded-full duration-300 flex-shrink-0"
                                                >
                                                    <XIcon size={14} />
                                                </button>
                                            }
                                        </div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                            {currentTab?.account?.is_create_tab &&
                                <button onClick={handleAddNewTab} className={`w-8 h-8 flex rounded-lg hover:bg-slate-300 duration-150 items-center justify-center`}>
                                    <Plus size={16}></Plus>
                                </button>
                            }
                        </Reorder.Group>
                    </div>
                </>
            ) : (
                <TabTitle />
            )}
        </div>
    )
}
export default TabBar