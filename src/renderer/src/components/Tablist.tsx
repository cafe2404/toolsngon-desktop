import { Loader2, PanelLeftOpen, PanelRightOpen, XIcon } from "lucide-react";
import { Reorder, motion } from "framer-motion";
import { useTabs } from "../contexts/TabContext";
import { MouseEvent } from "react";
import { usePanel } from "../contexts/PanelContext";

const Tablist = (): React.JSX.Element => {
    const { switchTab, tabs, currentTab, closeTab, setTabs } = useTabs();
    const { isOpen, togglePanel } = usePanel();
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

    return (
        <motion.div
            animate={{ width: isOpen ? 224 : 48 }} // 224px = w-56, 44px = w-11
            transition={{ type: "tween", duration: 0.05, ease: "easeInOut" }}
            className={`flex flex-col gap-1.5 h-full duration-200 bg-white border-r border-slate-200`}
        >
            {/* 📋 Tiêu đề + nút menu */}
            <div className={`flex items-center justify-between ${isOpen ? "pr-2 pl-4 " : 'px-2' } pt-1.5 mb-1.5`}>
                <motion.h3
                    initial={false}
                    animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                    className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                >
                    Đang mở
                </motion.h3>
                <button onClick={togglePanel} className='h-8 w-8 min-w-8 rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
                    {isOpen ? <PanelRightOpen size={16}></PanelRightOpen> : <PanelLeftOpen size={16}></PanelLeftOpen>}
                </button>
            </div>

            {/* 📁 Danh sách tab */}
            <div className="flex-1 no-scrollbar px-2" onWheel={onWheelHorizontal}>
                <Reorder.Group
                    layout="position"
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 30,
                    }}
                    axis="y"
                    values={externalTabs}
                    onReorder={onReorder}
                    className="w-full flex flex-col gap-2"
                >
                    {externalTabs.map((tab) => (
                        <Reorder.Item
                            value={tab}
                            key={tab.id}
                            onMouseDown={(e) => handleMouseDown(e, tab.id)}
                            onPointerDown={() => switchTab(tab.id)}
                            layout
                            className={`relative ${currentTab.id === tab.id
                                ? "bg-slate-200 "
                                : "hover:bg-slate-200 duration-150"
                                } rounded-lg p-2`}
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
                                            animate={{
                                                opacity: isOpen ? 1 : 0,
                                                width: isOpen ? "auto" : 0,
                                            }}
                                            className="line-clamp-1 text-left overflow-hidden"
                                        >
                                            {tab.title}
                                        </motion.span>
                                    </div>
                                    <motion.button
                                        initial={false}
                                        animate={{
                                            opacity: isOpen ? 1 : 0,
                                            width: isOpen ? "auto" : 0,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeTab(tab.id);
                                        }}
                                        className="flex items-center justify-center min-w-4 size-4 rounded-full duration-300"
                                    >
                                        <XIcon size={14} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        </Reorder.Item>

                    ))}
                </Reorder.Group>
            </div>
        </motion.div>
    );
};

export default Tablist;
