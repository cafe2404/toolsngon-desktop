import { JSX } from "react";
import { useTabs } from "../../contexts/TabContext";

const TabTitle = (): JSX.Element => {
    const { currentTab } = useTabs()
    return (
        <div className="text-center gap-2 navbar relative w-full h-8 flex items-center justify-center text-slate-800 text-sm font-medium">
            <p className="truncate">{currentTab.title}</p>
        </div >
    );
}

export default TabTitle;
