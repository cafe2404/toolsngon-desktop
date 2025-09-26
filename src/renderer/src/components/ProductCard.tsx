/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Clock, Hash, ClockPlus, SquareArrowOutUpRight } from "lucide-react";
import { UserProduct } from "src/types/global";
import { useTabs } from "../contexts/TabContext";

const ProductCard = ({ item }: { item: UserProduct }) => {
    const { addTab, tabs, switchTab } = useTabs()
    const handleOpenTab = () => {
        if (tabs.find(tab => tab.id === item.product.slug)) {
            switchTab(item.product.slug)
        return
        }
        addTab({
            id: item.product.slug,
            name: item.product.title,
            title: item.product.title,
            type: 'external',
            url: item.product.url,
            currentUrl: item.product.url,
            favicon: item.product.logo_url
        })
    }
    return (
        <div className="relative w-full white border border-slate-200 rounded-lg platform-item">
            <div className="flex relative group cursor-pointer gap-4 p-2">
                <div className="overflow-hidden rounded-lg border border-slate-200 w-24 h-24 min-w-24 aspect-square bg-white">
                    <img className="w-full h-full object-cover" src={item.product.logo_url} alt={item.product.title} />
                </div>
                <div className="py-2 relative w-full">
                    <div className="space-y-1.5">
                        <h3 className=" hover:underline text-lg font-semibold block leading-6 text-slate-800 truncate line-clamp-1">
                            {item.product.title}
                        </h3>
                        <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                            <Clock size={16}></Clock>
                            Hạn {new Date(item.end_date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                            <Hash size={16}></Hash>
                            {item.variant_duration.type}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-2 py-2 flex items-center gap-2 text-slate-800 border-t border-slate-200">
                <button onClick={handleOpenTab} className="rounded-md text-sm hover:bg-slate-200 gap-2 w-full px-2 py-2 flex items-center justify-center text-slate-600 duration-300">
                    <SquareArrowOutUpRight size={20}></SquareArrowOutUpRight>
                    Mở
                </button>
                <div className="h-6 bg-slate-200 w-px"></div>
                <button className="rounded-md text-sm hover:bg-slate-200 gap-2 w-full px-2 py-2 flex items-center justify-center text-slate-600 duration-300">
                    <ClockPlus size={20}></ClockPlus>
                    Gia hạn
                </button>
            </div>
        </div>
    );
}

export default ProductCard;
