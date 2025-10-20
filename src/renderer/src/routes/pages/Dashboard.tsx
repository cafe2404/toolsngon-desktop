/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Ban,  CheckCheck, Copy, LogOut, Search } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import ProductCard from "@renderer/components/ProductCard";
import { useProfiles } from "@renderer/contexts/ProfileContext";
import { useAuth } from "@renderer/contexts/AuthContext";

export default function Dashboard() {
    const { userProducts, userProductsLoading, userProductsError } = useAuth()
    const [query, setQuery] = useState<string>("")
    const [copyUUID, setCopyUUID] = useState<'copy' | 'copied' | 'error'>('copy')
    const { logout } = useAuth()
    const [appInfo, setAppInfo] = useState({
        device_name: "",
        os: "",
        app_version: ""
    })
    const [deviceUUID, setDeviceUUID] = useState("")
    const { currentTab } = useProfiles()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(deviceUUID)
            setCopyUUID('copied')
        } catch (err) {
            console.error('Copy failed:', err)
            setCopyUUID('error')
        } finally {
            // clear trạng thái sau 2s
            const timeout = setTimeout(() => setCopyUUID('copy'), 2500)
            return () => clearTimeout(timeout)
        }
    }

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (normalizedQuery.length === 0) return userProducts
        return userProducts.filter((item) => {
            const title = item.product.title?.toLowerCase() ?? ""
            const slug = item.product.slug?.toLowerCase() ?? ""
            const comboName = item.combo?.name?.toLowerCase() ?? ""
            const groupName = item.account_group?.name?.toLowerCase() ?? ""
            return (
                title.includes(normalizedQuery) ||
                slug.includes(normalizedQuery) ||
                comboName.includes(normalizedQuery) ||
                groupName.includes(normalizedQuery)
            )
        })
    }, [userProducts, query])
    const getAppInfo = async () => {
        const appInfo = await window.os.getAppInfo()
        setAppInfo(appInfo)
        const uuid = await window.os.getDeviceUUID()
        setDeviceUUID(uuid)
    }
    useEffect(() => {
        getAppInfo()
    }, [])
    return (
        <div className={`w-full flex flex-col gap-6 h-full relative overflow-y-auto`} style={{ display: currentTab?.id === "1" ? "flex" : "none" }}   >
            <div className="px-6 pt-6 flex-1">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 w-2xl">
                        <div className="relative border border-slate-200 w-full h-10 rounded-lg gap-1 no-drag flex items-center px-1 py-1">
                            <button className='px-2 py-0.5 h-full rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300'>
                                <Search size={16} />
                            </button>
                            <input
                                type="text"
                                className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2"
                                placeholder="Tìm kiếm nền tảng"
                                value={query}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {userProductsLoading && (
                    <div className='text-sm text-slate-600'>Đang tải...</div>
                )}
                {userProductsError && (
                    <div className='text-sm text-red-600'>{userProductsError}</div>
                )}

                {!userProductsLoading && !userProductsError && (
                    <>
                        {filteredItems.length === 0 ? (
                            <div className='text-sm text-slate-600'>Không có kết quả phù hợp</div>
                        ) : (
                            <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'}>
                                {filteredItems.map(item => (
                                    <ProductCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="sticky bottom-0 left-0 w-full px-1.5 py-0.5 bg-white flex items-center border-t border-t-slate-200 gap-2">
                <button className="flex items-center gap-2 py-1 px-2 duration-300 text-slate-600 hover:text-slate-800 rounded-lg">
                    <div className="relative size-2 flex items-center justify-center">
                        <div className="absolute size-2 top-0 left-0 bg-green-500 rounded-full animate-ping"></div>
                        <div className="relative size-2 bg-green-500 rounded-full z-10"></div>
                    </div>
                    <span className="text-sm">Version {appInfo.app_version}</span>
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-2 py-1 px-2 duration-300 text-slate-600 hover:text-slate-800 rounded-lg">
                    <span className="text-sm ">Device: {deviceUUID.slice(0, 10) + "..."}</span>
                    <button onClick={handleCopy} className="h-6 w-6 min-w-6 rounded-md text-slate-800 flex items-center justify-center duration-300 hover:bg-slate-300 ">
                        {
                            copyUUID === 'copied'
                                ? <CheckCheck size={14} className="text-green-500" />
                                : copyUUID === 'error'
                                    ? <Ban size={14} className="text-red-500"/>
                                    : <Copy size={14} />
                        }
                    </button>
                </div>
                <div className="flex-1">
                </div>
                <button onClick={logout} className="py-1 px-2 h-6 cursor-pointer hover:bg-slate-200 duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center gap-2">
                    <LogOut size={14} />
                    <span className="text-xs">Đăng xuất</span>
                </button>
            </div>
        </div>
    )
}
