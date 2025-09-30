/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { CheckCheckIcon, ChevronDown, Clock, Hash, UserIcon } from "lucide-react";
import { Account, UserProduct } from "src/types/global";
import { useTabs } from "../contexts/TabContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { useState } from "react";


const ProductCard = ({ item }: { item: UserProduct }) => {
    const { addTab, tabs, injectScript } = useTabs()
    const [currentAccount, setCurrentAccount] = useState<Account | undefined>(item.account_group?.accounts[0])
    const handleOpenTab = async () => {
        const tabId = `${item.product.slug}_${currentAccount?.id ?? '0'}`

        await addTab({
            id: tabId,
            name: item.product.title,
            title: item.product.title,
            type: 'external',
            url: item.product.url,
            currentUrl: item.product.url,
            favicon: item.product.logo_url,
            accounts: item.account_group?.accounts ?? [],
            pendingScript: currentAccount?.script
        })
        if (currentAccount?.script) {
            // inject after tab is created; injectScript waits for view readiness
            await injectScript(tabId, currentAccount.script)
        }
    }
    return (
        <div className="relative w-full white border border-slate-200 rounded-lg platform-item">
            <div className="flex relative group cursor-pointer gap-4 p-2">
                <div onClick={handleOpenTab} className="overflow-hidden rounded-lg border relative border-slate-200 w-24 h-24 min-w-24 aspect-square bg-white">
                    {tabs.find(tab => tab.id === item.product.slug) && (
                        <div className="absolute bottom-0 px-2 py-1 left-0 w-full flex flex-col justify-end backdrop-blur-sm bg-slate-950/50">
                            <div className="flex items-center gap-2 justify-center">
                                <p className="text-white text-xs">Đang mở</p>
                            </div>
                        </div>
                    )}
                    <img className="w-full h-full object-cover" src={item.product.logo_url} alt={item.product.title} />
                </div>
                <div className="py-2 relative w-full">
                    <div className="space-y-1.5 w-full">
                        <h3 onClick={handleOpenTab} className="hover:underline line-clamp-1 text-lg font-semibold leading-6 text-slate-800 ">
                            {item.product.title}
                        </h3>
                        <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                            <Clock size={16}></Clock>
                            Hạn {new Date(item.end_date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                            <Hash size={16}></Hash>
                            {item?.account_group?.type ?? "Tạm chờ"}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-2 py-2 flex items-center gap-2 text-slate-800 border-t border-slate-200">

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button onClick={handleOpenTab} className="rounded-md text-sm bg-slate-50 hover:bg-slate-100 gap-2 w-56 px-2 py-2 flex items-center justify-between text-slate-600 duration-300">
                            <div className="flex items-center gap-1">
                                <UserIcon size={20} />
                                {currentAccount ? currentAccount?.name ?? `Tài khoản ${currentAccount.id}` : "Chọn tài khoản"}
                            </div>
                            <ChevronDown size={20} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" alignOffset={0} sideOffset={5} align="start" >
                        <DropdownMenuLabel>Chọn tài khoản</DropdownMenuLabel>
                        {item.account_group?.accounts && item.account_group.accounts.map((account, i) => (
                            <DropdownMenuItem key={i}
                                onClick={() => setCurrentAccount(account)}
                            >
                                <p className="truncate">{account.name || `Tài khoản ${account.id}`}</p>
                                {currentAccount?.id === account.id &&
                                    <DropdownMenuShortcut>
                                        <CheckCheckIcon size={20} />
                                    </DropdownMenuShortcut>
                                }
                            </DropdownMenuItem>
                        ))}

                    </DropdownMenuContent>
                </DropdownMenu>
                <button onClick={handleOpenTab} className="flex-1 bg-slate-50 rounded-md text-sm hover:bg-slate-100 gap-2 px-2 py-2 flex items-center justify-center text-slate-600 duration-300">
                    Mở
                </button>
            </div >
        </div >
    );
}

export default ProductCard;
