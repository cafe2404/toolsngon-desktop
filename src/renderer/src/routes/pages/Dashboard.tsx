import { ArrowUp, Ban, CheckCheck, ChevronDown, Copy, Headset, Search } from "lucide-react";
import { JSX, useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import ProductCard from "@renderer/components/ProductCard";
import { useProfiles } from "@renderer/contexts/ProfileContext";
import { useAuth } from "@renderer/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"


export default function Dashboard(): JSX.Element {
    const { userProducts, userProductsLoading, userProductsError, appSetting, categories } = useAuth()
    const [query, setQuery] = useState<string>("")
    const [copyUUID, setCopyUUID] = useState<'copy' | 'copied' | 'error'>('copy')

    const [appInfo, setAppInfo] = useState({
        device_name: "",
        os: "",
        app_version: ""
    })
    const containerRef = useRef<HTMLDivElement>(null)
    const [deviceUUID, setDeviceUUID] = useState("")
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
    const [showScrollTop, setShowScrollTop] = useState(false)
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
            // eslint-disable-next-line no-unsafe-finally
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

    const groupedItems = useMemo(() => {
        const fallbackGroupName = "Khác"
        const groupedMap = new Map<string, { name: string; sectionId: string; items: typeof filteredItems }>()
        const categoryMap = new Map(categories.map((category) => [category.name.trim().toLowerCase(), category]))

        for (const item of filteredItems) {
            const categoryName = item.account_group?.category?.name?.trim()
            const groupName = categoryName && categoryName.length > 0 ? categoryName : fallbackGroupName
            const key = groupName.toLowerCase()
            const matchedCategory = categoryMap.get(key)
            const sectionId = matchedCategory ? `cattegory-${matchedCategory.id}` : "cattegory-khac"

            if (!groupedMap.has(key)) {
                groupedMap.set(key, { name: groupName, sectionId, items: [] })
            }

            groupedMap.get(key)?.items.push(item)
        }

        const sortedByCategoryOrder = categories
            .map((category) => groupedMap.get(category.name.trim().toLowerCase()))
            .filter((group): group is { name: string; sectionId: string; items: typeof filteredItems } => Boolean(group))

        const otherGroups = Array.from(groupedMap.values()).filter(
            (group) => !categories.some((category) => category.name.trim().toLowerCase() === group.name.toLowerCase())
        )

        return [...sortedByCategoryOrder, ...otherGroups]
    }, [filteredItems, categories])

    const handleScrollToCategory = (event: MouseEvent<HTMLAnchorElement>, sectionId: string): void => {
        event.preventDefault()
        const section = document.getElementById(sectionId)
        if (!section) return
        section.scrollIntoView({ behavior: "smooth", block: "start" })
        window.history.replaceState(null, "", `#${sectionId}`)
    }

    const handleToggleSection = (sectionId: string): void => {
        setCollapsedSections((prev) => {
            const next = new Set(prev)
            if (next.has(sectionId)) {
                next.delete(sectionId)
            } else {
                next.add(sectionId)
            }
            return next
        })
    }

    const handleScrollToTop = (): void => {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }

    const getAppInfo = async (): Promise<void> => {
        const appInfo = await window.os.getAppInfo()
        setAppInfo(appInfo)
        const uuid = await window.os.getDeviceUUID()
        setDeviceUUID(uuid)
    }
    useEffect(() => {
        getAppInfo()
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = (): void => {
            setShowScrollTop(container.scrollTop > 200)
        }

        handleScroll()
        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [])
    return (
        <div ref={containerRef} className={`w-full flex flex-col gap-6 h-full relative overflow-y-auto`} style={{ display: currentTab?.id === "1" ? "flex" : "none" }}   >
            {appSetting && appSetting?.top_banner &&
                <div className="">
                    <div
                        dangerouslySetInnerHTML={{ __html: appSetting?.top_banner }}
                    ></div>
                </div>
            }
            <div className="px-6 flex-1">
                <div className="flex flex-col gap-2 py-4 s bg-white">
                    <div className="flex items-center gap-2 w-full">
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
                    <div className="flex items-center gap-2 w-full">

                        {categories.map(category => (
                            <a
                                href={`#cattegory-${category.id}`}
                                key={category.id}
                                onClick={(event) => handleScrollToCategory(event, `cattegory-${category.id}`)}
                                className="bg-white rounded-md text-sm hover:border-slate-500 gap-2 px-2 py-1.5 flex items-center justify-center text-slate-600 duration-300 border border-slate-200"
                            >
                                <span className="text-sm">{category.name}</span>
                            </a>
                        ))}
                        <a
                            href="#cattegory-khac"
                            onClick={(event) => handleScrollToCategory(event, "cattegory-khac")}
                            className="bg-white rounded-md text-sm hover:border-slate-500 gap-2 px-2 py-1.5 flex items-center justify-center text-slate-600 duration-300 border border-slate-200"
                        >
                            <span className="text-sm">Khác</span>
                        </a>
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
                            <div className="flex flex-col gap-6">
                                {groupedItems.map((group) => (
                                    <section id={group.sectionId} key={group.name} className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-semibold text-slate-800">{group.name}</h2>
                                            <button
                                                onClick={() => handleToggleSection(group.sectionId)}
                                                className="text-sm text-slate-600 p-2 hover:text-slate-800 rounded-md flex items-center justify-center duration-300 hover:bg-slate-200"
                                            >
                                                <ChevronDown
                                                    size={16}
                                                    className={`duration-300 ${collapsedSections.has(group.sectionId) ? "-rotate-90" : "rotate-0"}`}
                                                />
                                            </button>
                                        </div>
                                        {!collapsedSections.has(group.sectionId) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                                {group.items.map(item => (
                                                    <ProductCard key={item.id} item={item} />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="sticky bottom-0 left-0 w-full px-1.5 py-0.5 bg-white flex items-center border-t border-t-slate-200 gap-2">
                <button className="flex items-center gap-2 py-1 duration-300 pl-2 text-slate-600 hover:text-slate-800 rounded-lg">
                    <div className="relative size-2 flex items-center justify-center">
                        <div className="absolute size-2 top-0 left-0 bg-green-500 rounded-full animate-ping"></div>
                        <div className="relative size-2 bg-green-500 rounded-full z-10"></div>
                    </div>
                    <span className="text-sm">Version {appInfo.app_version}</span>
                </button>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-2 py-1 duration-300 text-slate-600 hover:text-slate-800 rounded-lg">
                    <span className="text-sm ">Device: {deviceUUID.slice(0, 10) + "..."}</span>
                    <button onClick={handleCopy} className="h-6 w-6 min-w-6 rounded-md text-slate-800 flex items-center justify-center duration-300 hover:bg-slate-200 ">
                        {
                            copyUUID === 'copied'
                                ? <CheckCheck size={14} className="text-green-500" />
                                : copyUUID === 'error'
                                    ? <Ban size={14} className="text-red-500" />
                                    : <Copy size={14} />
                        }
                    </button>
                </div>
                <div className="flex-1">
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="py-1 px-2 h-6 cursor-pointer hover:bg-blue-600 duration-300 text-white bg-blue-500 rounded-md flex items-center gap-2">
                            <Headset size={14} />
                            <span className="text-sm">Hỗ trợ</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            {appSetting && appSetting.socials.map(social => (
                                <DropdownMenuItem key={social.title} asChild>
                                    <a href={social.url} target="_blank" rel="noreferrer">
                                        <span className="size-6 rounded-full flex items-center justify-center">
                                            <img src={social.icon} alt="" />
                                        </span>
                                        {social.title}
                                    </a>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {showScrollTop && (
                <button
                    onClick={handleScrollToTop}
                    className="fixed bottom-16 right-6 z-40 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 duration-300"
                >
                    <ArrowUp size={18} />
                </button>
            )}
        </div>
    )
}
