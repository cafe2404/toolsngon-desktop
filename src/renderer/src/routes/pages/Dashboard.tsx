/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Grid2x2, List, Search } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { api } from "@renderer/lib/axios";
import ProductCard from "@renderer/components/ProductCard";
import { UserProduct } from "src/types/global";
import { useTabs } from "@renderer/contexts/TabContext";


export default function Dashboard() {
    const [viewMode, setViewMode] = useState<"List" | "Grid">("Grid")
    const [items, setItems] = useState<UserProduct[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState<string>("")
    const { currentTab } = useTabs()    
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const res = await api.get<UserProduct[]>("/api/user-products/")
                setItems(res.data)
            } catch {
                setError("Không thể tải danh sách sản phẩm")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (normalizedQuery.length === 0) return items
        return items.filter((item) => {
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
    }, [items, query])

    return (
        <div className={`w-full flex flex-col gap-6 p-6 h-full overflow-y-auto`} style={{display: currentTab.id === "1" ? "block" : "none"}}   >
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
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-200  items-center justify-center p-0.5 h-10 rounded-lg border border-slate-200">
                        <button onClick={() => setViewMode("Grid")} className={`w-8 h-8 min-w-8 flex items-center justify-center text-slate-600 rounded-md duration-300 ${viewMode === 'Grid' ? 'bg-white text-slate-800' : 'text-slate-600'}`}>
                            <Grid2x2 size={16}></Grid2x2>
                        </button>
                        <button onClick={() => setViewMode("List")} className={`w-8 h-8 min-w-8 flex items-center justify-center text-slate-600 rounded-md duration-300 ${viewMode === 'List' ? 'bg-white text-slate-800' : 'text-slate-600'}`}>
                            <List size={16}></List>
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className='text-sm text-slate-600'>Đang tải...</div>
            )}
            {error && (
                <div className='text-sm text-red-600'>{error}</div>
            )}

            {!loading && !error && (
                <>
                    {filteredItems.length === 0 ? (
                        <div className='text-sm text-slate-600'>Không có kết quả phù hợp</div>
                    ) : (
                        <div className={viewMode === 'Grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4' : 'flex flex-col gap-2'}>
                            {filteredItems.map(item => (
                                <ProductCard key={item.id} item={item}/>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
