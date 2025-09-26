import WebView from '../../components/WebView';
import { useTabs } from '../../contexts/TabContext';
import Dashboard from './Dashboard';

const TabContent = (): React.JSX.Element => {
    const { tabs } = useTabs()
    return (
        <>
            {tabs.map(tab => (
                tab.name === "dashboard" ? (
                    <Dashboard key={tab.id} />
                ) : (
                    <WebView key={tab.id} url={tab.url ?? ""} id={tab.id} />
                )
            ))}
        </>
    );
}

export default TabContent;
