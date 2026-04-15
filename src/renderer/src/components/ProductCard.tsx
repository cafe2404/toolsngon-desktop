import { CheckCheckIcon, ChevronDown, Clock, Hash, LoaderCircle, UserIcon } from "lucide-react";
import { Account, UserProduct } from "src/types/global";
import { useProfiles } from "../contexts/ProfileContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { JSX, useState } from "react";


const ProductCard = ({ item }: { item: UserProduct }): JSX.Element => {
    const { addTab, currentProfile, injectScript, switchTab, addProfile, setCurrentProfile, profiles } = useProfiles()
    const [loading, setLoading] = useState(false)

    const handleOpenTab = async (account: Account): Promise<void> => {
        if (!currentProfile) return;

        setLoading(true)
        const tabId = `${item.product.slug}_${account?.id ?? '0'}`

        const existingProfile = profiles.find(profile => profile.account?.id === account?.id
        )
        if (existingProfile) {
            setCurrentProfile(existingProfile.id)
            const existingTab = existingProfile.tabs.find(tab => tab.id === tabId)
            if (existingTab) {
                await switchTab(existingProfile.id, tabId)
            } else {
                await addTab(existingProfile.id, {
                    id: tabId,
                    name: item.product.title,
                    title: item.product.title,
                    url: item.product.url,
                    currentUrl: item.product.url,
                    favicon: item.product.logo_url,
                })
            }
            setLoading(false)
            return
        }

        const newProfileId = `profile_${item.product.slug}_${account?.id ?? '0'}`
        const newProfile = {
            id: newProfileId,
            icon: item.product.logo_url,
            partition: `persist:profile-${newProfileId}`,
            tabs: [],
            currentTabId: undefined,
            type: "external" as const,
            name: item.product.title + ` (${account?.id})`,
            account: account,
        }
        addProfile(newProfile)
        setCurrentProfile(newProfileId)
        await addTab(newProfileId, {
            id: tabId,
            name: item.product.title,
            title: item.product.title,
            url: item.product.url,
            currentUrl: item.product.url,
            favicon: item.product.logo_url,
        })

        if (account?.open_chrome) {
            await window.api.browserView.openChrome(tabId, item.product.url, account)
            setLoading(false)
            return
        }
        if (account?.script) {
            await injectScript(tabId, account.script)
        }
        setLoading(false)
    }
    return (
        <>
            {
                item.account_group && item.account_group?.accounts.length > 0 &&
                item.account_group?.accounts && item.account_group.accounts.map((account, i) => (
                    <div key={i} className={`relative w-full white border border-slate-200 rounded-lg platform-item ${!account.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {
                            !account.is_active &&
                            <div className="absolute inset-0 bg-transparent rounded-lg cursor-not-allowed z-50"></div>
                        }
                        <div className="flex group gap-4 p-2 relative">
                            <div className="overflow-hidden rounded-lg border relative border-slate-200 w-24 h-24 min-w-24 aspect-square bg-white">
                                <img className="w-full h-full object-cover" src={item.product.logo_url} alt={item.product.title} />
                            </div>
                            <div className="py-2 relative w-full">
                                <div className="space-y-1.5 w-full">
                                    <h3 onClick={() => handleOpenTab(account)} className="cursor-pointer hover:underline line-clamp-1 text-lg font-semibold leading-6 text-slate-800 ">
                                        {account?.name ?? `Tài khoản ${account?.id}`}
                                    </h3>
                                    <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                        <Clock size={16}></Clock>
                                        Hạn {new Date(item.end_date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                        <Hash size={16}></Hash>
                                        {item.product.title} {item?.account_group?.type ?? "Tạm chờ"}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center duration-300 absolute top-4 right-4">
                                <div className="relative size-3 flex items-center justify-center">
                                    {
                                        account.is_active &&
                                            <div className={`absolute size-3 top-0 left-0 rounded-full animate-ping bg-green-500`}></div>
                                    }
                                    <div className={`relative size-3 ${account.is_active ? 'bg-green-500' : 'bg-red-500'} rounded-full z-10`}></div>
                                </div>
                            </div>
                        </div>
                        <div className="px-2 py-2 flex items-center gap-2 text-slate-800">

                            <button onClick={() => handleOpenTab(account)} className={`${loading && "opacity-50 cursor-not-allowed"} cursor-pointer flex-1 bg-slate-100 rounded-md text-sm hover:bg-slate-200 gap-2 px-2 py-2 flex items-center justify-center font-medium text-slate-600 duration-300`}>
                                {loading && <LoaderCircle className="animate-spin text-slate-800" size={20}></LoaderCircle>}
                                {account.is_active ? 'Mở' : 'Bảo trì'}
                            </button>
                        </div>
                    </div >
                ))
            }
        </>
    );
}

export default ProductCard;
