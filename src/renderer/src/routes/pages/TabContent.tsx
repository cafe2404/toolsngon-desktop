import WebView from '../../components/WebView';
import { useTabs } from '../../contexts/TabContext';

const TabContent = (): React.JSX.Element => {
    const { tabs, splitTabs } = useTabs()
    return (
        <div className='w-full h-full flex'>
            {splitTabs && splitTabs.length === 2 ? (
                <>
                    {splitTabs.map((id) => {
                        const tab = tabs.find(t => t.id === id)
                        if (!tab) return null
                        return (
                            <div key={id} className='flex-1 min-w-0 border-l border-slate-200 first:border-l-0'>
                                {tab.type === 'internal' && tab.component ? (
                                    (() => { const Component = tab.component; return <Component /> })()
                                ) : (
                                    <WebView tab={tab} />
                                )}
                            </div>
                        )
                    })}
                </>
            ) : (
                tabs.map((tab) => {
                    if (tab.type === "internal" && tab.component) {
                        const Component = tab.component
                        return <Component key={tab.id} />
                    } else {
                        return <WebView key={tab.id} tab={tab} />
                    }
                })
            )}
        </div>

    );
}

export default TabContent;
