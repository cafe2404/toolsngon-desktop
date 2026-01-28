import { Cookie } from "electron";
import { useEffect, useState } from "react";
import { useProfiles } from "../contexts/ProfileContext";
import { Button } from "./ui/button";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon } from "lucide-react";

type CopyId = 'proxy' | 'device' | 'fingerprint' | 'indexeddb' | 'websql' | 'cache' | 'cookies' | 'session' | 'local';

type ViewInfo = {
    accountId?: number
    accountName?: string
    currentUrl: string
    proxy: {
        config: string
        ipAddress: string | null
        proxyString: string | null
    }
    device: {
        id: number
        user_agent?: string
        screen_resolution?: string
        language?: string
        timezone?: string
        platform?: string
        ip_address: string | null
        location?: string
        hardware_concurrency?: number
        device_memory?: number
        first_seen?: string
        last_seen?: string
        is_active?: boolean
    } | null
    fingerprint: Record<string, unknown> | null
    userAgent: string
    sessionId: string
} | null

const TabInfo = (): React.JSX.Element => {
    const { currentTab } = useProfiles();
    const [cookies, setCookies] = useState<Cookie[]>([]);
    const [sessionStorage, setSessionStorage] = useState<Record<string, string> | null>(null);
    const [localStorage, setLocalStorage] = useState<Record<string, string> | null>(null);
    const [indexedDB, setIndexedDB] = useState<{
        available: boolean
        message?: string
        error?: string
    } | null>(null);
    const [webSQL, setWebSQL] = useState<{
        available: boolean
        message?: string
    } | null>(null);
    const [cache, setCache] = useState<{
        available: boolean
        caches?: Array<{
            name: string
            count: number
            urls: string[]
        }>
        message?: string
        error?: string
    } | null>(null);
    const [viewInfo, setViewInfo] = useState<ViewInfo>(null);
    const [copied, setCopied] = useState<CopyId | null>(null);

    const handleCopy = (text: string, id: CopyId): void => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => {
            setCopied(null);
        }, 2000);
    }

    const loadTabInfo = async (): Promise<void> => {
        if (!currentTab) return;

        try {
            const [cookiesData, info, sessionStorageData, localStorageData, indexedDBData, webSQLData, cacheData] = await Promise.all([
                window.api.browserView.getCookies(currentTab.id),
                window.api.browserView.getInfo(currentTab.id),
                window.api.browserView.getSessionStorage(currentTab.id),
                window.api.browserView.getLocalStorage(currentTab.id),
                window.api.browserView.getIndexedDB(currentTab.id),
                window.api.browserView.getWebSQL(currentTab.id),
                window.api.browserView.getCache(currentTab.id)
            ]);

            setCookies(cookiesData || []);
            setViewInfo(info);
            setSessionStorage(sessionStorageData);
            setLocalStorage(localStorageData);
            setIndexedDB(indexedDBData);
            setWebSQL(webSQLData);
            setCache(cacheData);
        } catch (error) {
            console.error('Error loading tab info:', error);
        }
    }
    const [isOpen, setIsOpen] = useState<CopyId[]>(['proxy', 'device', 'indexeddb', 'websql', 'cache', 'cookies']);
    const handleToggle = (id: CopyId): void => {
        setIsOpen(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
    useEffect(() => {
        if (currentTab) {
            loadTabInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab]);

    const InfoSection = ({ data, copyId, title }: { data: unknown; copyId: CopyId, title: string }): React.JSX.Element => (
        <div className={`text-sm overflow-y-hidden text-slate-800 p-2 bg-slate-100 rounded-md relative ${isOpen.includes(copyId) ? 'max-h-full' : 'max-h-24'}`}>
            <h3 className="text-xs font-semibold text-slate-600 mb-1">{title}</h3>
            <div className="flex items-center gap-2 absolute top-2 right-2 ">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => handleCopy(JSON.stringify(data, null, 2), copyId)}
                >
                    {copied === copyId ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleToggle(copyId)}
                >
                    {!isOpen.includes(copyId) ? <>
                        Mở rộng
                        <ChevronDownIcon className="h-4 w-4" />
                    </> : <>
                        Thu gọn
                        <ChevronUpIcon className="h-4 w-4" />
                    </>}
                </Button>
            </div>
            {data ? (
                <pre className="break-words whitespace-pre-wrap pr-10">{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p className="text-slate-500 italic">Không có dữ liệu</p>
            )}
        </div>
    );

    return (
        <div className="w-1/2 min-w-1/2 h-full bg-white border-l border-slate-200 overflow-y-auto animate-in">
            <div className="p-4">
                <h1 className="text-md mb-4 font-medium text-slate-800">Thông tin browser</h1>

                {viewInfo ? (
                    <div className="space-y-3">
                        <div className="text-sm overflow-y-hidden text-slate-800 p-2 bg-slate-100 rounded-md relative">
                            {viewInfo.accountName && <p><span className="font-medium">Tên:</span> {viewInfo.accountName}</p>}
                            {viewInfo.accountId && <p><span className="font-medium">ID:</span> {viewInfo.accountId}</p>}
                            <p><span className="font-medium">URL:</span> {viewInfo.currentUrl}</p>
                        </div>
                        {viewInfo.proxy && (
                            <InfoSection
                                data={{
                                    ipAddress: viewInfo.proxy.ipAddress,
                                    proxyString: viewInfo.proxy.proxyString,
                                    config: viewInfo.proxy.config
                                }}
                                copyId="proxy"
                                title="Thông tin IP/Proxy"
                            />
                        )}

                        {viewInfo.device && (
                            <InfoSection data={viewInfo.device} copyId="device" title="Thông tin thiết bị" />
                        )}

                        {viewInfo.fingerprint && (
                            <InfoSection data={viewInfo.fingerprint} copyId="fingerprint" title="Browser Fingerprint" />
                        )}
                        <InfoSection data={cookies} copyId="cookies" title="Cookies" />
                        <InfoSection data={sessionStorage} copyId="session" title="Session Storage" />
                        <InfoSection data={localStorage} copyId="local" title="Local Storage" />
                        <InfoSection data={indexedDB} copyId="indexeddb" title="IndexedDB" />
                        <InfoSection data={webSQL} copyId="websql" title="Web SQL" />
                        <InfoSection data={cache} copyId="cache" title="Cache" />
                    </div>

                ) : (
                    <p className="text-slate-500 italic">Không có thông tin</p>
                )}
            </div >
        </div >
    );
}

export default TabInfo;
