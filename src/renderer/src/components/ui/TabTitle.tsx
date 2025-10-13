import { JSX } from "react";
import { useTabs } from "../../contexts/TabContext";
import { XIcon } from "lucide-react";

const TabTitle = (): JSX.Element => {
    const { currentTab, closeTab } = useTabs()
    return (
        <div className="px-44 text-center gap-2 navbar relative min-h-9 h-9 bg-white flex items-center justify-center text-slate-800 text-sm font-medium">
            <p className="truncate">{currentTab.title}</p>
            <button onClick={(e) => {
                e.stopPropagation();
                closeTab(currentTab.id);
            }} className="flex items-center hover:bg-slate-200 justify-center min-w-4 size-4 rounded-full duration-300">
                <XIcon size={14} />
            </button>
        </div >
    );
}

export default TabTitle;
