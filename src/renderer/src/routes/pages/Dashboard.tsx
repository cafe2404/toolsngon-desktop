import { Ban, CheckCheck, ChevronDown, Copy, Package, Search } from 'lucide-react'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { JSX, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import ProductCard from '@renderer/components/ProductCard'
import { useProfiles } from '@renderer/contexts/ProfileContext'
import { useAuth } from '@renderer/contexts/AuthContext'
import { Carousel, CarouselContent, CarouselItem } from '@renderer/components/ui/carousel'
import { useLanguage } from '@renderer/contexts/LanguageContext'
import { desktop } from '@renderer/lib/desktop'

const toLucideIconName = (icon?: string | null): IconName | null => {
  if (!icon) return null
  return icon
    .trim()
    .replace(/^Lucide/i, '')
    .replace(/Icon$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/^lucide-/, '')
    .replace(/-icon$/, '')
    .toLowerCase() as IconName
}

const CategoryIcon = ({
  icon,
  size = 14
}: {
  icon?: string | null
  size?: number
}): JSX.Element | null => {
  const iconName = toLucideIconName(icon)
  if (!iconName) return null

  return (
    <DynamicIcon
      name={iconName}
      size={size}
      className="shrink-0"
      fallback={() => <Package size={size} className="shrink-0" />}
    />
  )
}

export default function Dashboard(): JSX.Element {
  const { userProducts, userProductsLoading, userProductsError, appSetting, categories } = useAuth()
  const { t } = useLanguage()
  const [query, setQuery] = useState<string>('')
  const [copyUUID, setCopyUUID] = useState<'copy' | 'copied' | 'error'>('copy')

  const containerRef = useRef<HTMLDivElement>(null)
  const [deviceUUID, setDeviceUUID] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [activeSectionId, setActiveSectionId] = useState<string>('')
  const { currentTab } = useProfiles()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(deviceUUID)
      setCopyUUID('copied')
    } catch (err) {
      console.error('Copy failed:', err)
      setCopyUUID('error')
    } finally {
      const timeout = setTimeout(() => setCopyUUID('copy'), 2500)
      // eslint-disable-next-line no-unsafe-finally
      return () => clearTimeout(timeout)
    }
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (normalizedQuery.length === 0) return userProducts
    return userProducts.filter((item) => {
      const title = item.product.title?.toLowerCase() ?? ''
      const slug = item.product.slug?.toLowerCase() ?? ''
      const comboName = item.combo?.name?.toLowerCase() ?? ''
      const groupName = item.account_group?.name?.toLowerCase() ?? ''
      return (
        title.includes(normalizedQuery) ||
        slug.includes(normalizedQuery) ||
        comboName.includes(normalizedQuery) ||
        groupName.includes(normalizedQuery)
      )
    })
  }, [userProducts, query])

  const groupedItems = useMemo(() => {
    const fallbackGroupName = t('dashboard.other')
    const groupedMap = new Map<
      string,
      { name: string; sectionId: string; icon?: string | null; items: typeof filteredItems }
    >()
    const categoryMap = new Map(
      categories.map((category) => [category.name.trim().toLowerCase(), category])
    )

    for (const item of filteredItems) {
      const categoryName = item.account_group?.category?.name?.trim()
      const groupName = categoryName && categoryName.length > 0 ? categoryName : fallbackGroupName
      const key = groupName.toLowerCase()
      const matchedCategory = categoryMap.get(key)
      const sectionId = matchedCategory ? `cattegory-${matchedCategory.id}` : 'cattegory-khac'

      if (!groupedMap.has(key)) {
        groupedMap.set(key, { name: groupName, sectionId, icon: matchedCategory?.icon, items: [] })
      }

      groupedMap.get(key)?.items.push(item)
    }

    const sortedByCategoryOrder = categories
      .map((category) => groupedMap.get(category.name.trim().toLowerCase()))
      .filter(
        (
          group
        ): group is {
          name: string
          sectionId: string
          icon?: string | null
          items: typeof filteredItems
        } => Boolean(group)
      )

    const otherGroups = Array.from(groupedMap.values()).filter(
      (group) =>
        !categories.some(
          (category) => category.name.trim().toLowerCase() === group.name.toLowerCase()
        )
    )

    return [...sortedByCategoryOrder, ...otherGroups]
  }, [filteredItems, categories, t])

  const handleScrollToCategory = (sectionId: string): void => {
    const section = document.getElementById(sectionId)
    if (!section) return
    setActiveSectionId(sectionId)
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${sectionId}`)
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

  const getAppInfo = async (): Promise<void> => {
    const uuid = await desktop.app.getDeviceUUID()
    setDeviceUUID(uuid)
  }
  useEffect(() => {
    getAppInfo()
  }, [])

  useEffect(() => {
    if (groupedItems.length === 0) {
      setActiveSectionId('')
      return
    }

    setActiveSectionId((prev) => prev || groupedItems[0].sectionId)
  }, [groupedItems])

  useEffect(() => {
    const container = containerRef.current
    if (!container || groupedItems.length === 0) return

    const handleScroll = (): void => {
      const containerRect = container.getBoundingClientRect()
      const activationLine = containerRect.top + 120
      let nextSectionId = groupedItems[0].sectionId

      for (const group of groupedItems) {
        const section = document.getElementById(group.sectionId)
        if (!section) continue

        if (section.getBoundingClientRect().top <= activationLine) {
          nextSectionId = group.sectionId
        } else {
          break
        }
      }

      setActiveSectionId((prev) => (prev === nextSectionId ? prev : nextSectionId))
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => container.removeEventListener('scroll', handleScroll)
  }, [groupedItems])

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-6 h-full relative overflow-y-auto bg-white`}
      style={{ display: currentTab?.id === '1' ? 'flex' : 'none' }}
    >
      {appSetting && appSetting?.top_banner && (
        <div className="">
          <div dangerouslySetInnerHTML={{ __html: appSetting?.top_banner }}></div>
        </div>
      )}
      <div className="px-4 flex-1 bg-white">
        <div className="flex flex-col gap-2 py-4 sticky top-0 z-50 bg-white">
          <div className="flex items-center gap-2 w-full">
            <div className="relative border border-slate-200 w-full h-10 rounded-lg gap-1 no-drag flex items-center px-1 py-1">
              <button className="px-2 py-0.5 h-full rounded-lg hover:bg-slate-200 text-slate-800 flex items-center justify-center duration-300">
                <Search size={16} />
              </button>
              <input
                type="text"
                className="bg-transparent focus:outline-none text-slate-800 text-sm w-full pr-2"
                placeholder={t('dashboard.searchPlaceholder')}
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Carousel
              opts={{ align: 'start', dragFree: true }}
              className="mb-2 w-full"
              aria-label={t('dashboard.categoryAriaLabel')}
            >
              <CarouselContent className="-ml-2">
                {categories.map((category) => (
                  <CarouselItem
                    key={category.id}
                    onClick={() => handleScrollToCategory(`cattegory-${category.id}`)}
                    className={`basis-auto ml-2 rounded-md text-sm gap-2 px-2 py-1.5 flex items-center justify-center bg-white duration-150 border ${activeSectionId === `cattegory-${category.id}` ? ' font-medium border-blue-600 text-blue-600' : ' hover:border-slate-500 text-slate-600 border-slate-200'}`}
                  >
                    <CategoryIcon icon={category.icon} />
                    <span className="text-sm">{category.name}</span>
                  </CarouselItem>
                ))}
                <CarouselItem
                  key={'cattegory-khac'}
                  onClick={() => handleScrollToCategory(`cattegory-khac`)}
                  className={`basis-auto ml-2 rounded-md text-sm gap-2 px-2 py-1.5 flex items-center justify-center bg-white duration-150 border ${activeSectionId === 'cattegory-khac' ? ' font-medium border-blue-600 text-blue-600' : 'hover:border-slate-500 text-slate-600 border-slate-200'}`}
                >
                  <Package size={14} className="shrink-0" />
                  <span className="text-sm">{t('dashboard.other')}</span>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
        </div>
        {userProductsLoading && <div className="text-sm text-slate-600">{t('common.loading')}</div>}
        {userProductsError && <div className="text-sm text-red-600">{userProductsError}</div>}

        {!userProductsLoading && !userProductsError && (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-sm text-slate-600">{t('dashboard.noResults')}</div>
            ) : (
              <div className="flex flex-col gap-6">
                {groupedItems.map((group) => (
                  <section id={group.sectionId} key={group.name} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon icon={group.icon} size={16} />
                      <h2 className="text-base font-semibold text-slate-800">{group.name}</h2>
                      <button
                        onClick={() => handleToggleSection(group.sectionId)}
                        className="text-sm text-slate-600 p-2 hover:text-slate-800 rounded-md flex items-center justify-center duration-300 hover:bg-slate-200"
                      >
                        <ChevronDown
                          size={16}
                          className={`duration-300 ${collapsedSections.has(group.sectionId) ? '-rotate-90' : 'rotate-0'}`}
                        />
                      </button>
                    </div>
                    {!collapsedSections.has(group.sectionId) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {group.items.map((item) => (
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
        <div className="flex items-center gap-2 py-1 duration-300 text-slate-600 hover:text-slate-800 rounded-lg">
          <span className="text-sm ">
            {t('dashboard.device')}: {deviceUUID.slice(0, 10) + '...'}
          </span>
          <button
            onClick={handleCopy}
            className="h-6 w-6 min-w-6 rounded-md text-slate-800 flex items-center justify-center duration-300 hover:bg-slate-200 "
          >
            {copyUUID === 'copied' ? (
              <CheckCheck size={14} className="text-green-500" />
            ) : copyUUID === 'error' ? (
              <Ban size={14} className="text-red-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  )
}
