import { JSX } from "react";
import { useTabs } from "../../contexts/TabContext";

const TabTitle = (): JSX.Element => {
    const { currentTab } = useTabs()
    return (
        <div className="px-38 navbar relative min-h-9 h-9 bg-white flex items-center justify-center text-slate-800 text-sm font-medium">
            {currentTab.title}
        </div>
    );
}

export default TabTitle;
