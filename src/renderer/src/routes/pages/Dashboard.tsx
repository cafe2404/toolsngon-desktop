/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Search } from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";
import ProductCard from "@renderer/components/ProductCard";
import { useTabs } from "@renderer/contexts/TabContext";
import { useAuth } from "@renderer/contexts/AuthContext";


export default function Dashboard() {
    const { userProducts, userProductsLoading, userProductsError } = useAuth()
    const [query, setQuery] = useState<string>("")
    const { currentTab } = useTabs()
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

    return (
        <div className={`w-full flex flex-col gap-6 p-6 h-full overflow-y-auto`} style={{ display: currentTab.id === "1" ? "flex" : "none" }}   >
            <div className="flex items-center justify-between">
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
                        <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4'}>
                            {filteredItems.map(item => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
