/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React, { useEffect, useState } from 'react'
import { useProfiles } from '../contexts/ProfileContext'
import OpenApps from './OpenApps'
import {
    ArrowRight,
    BellIcon,
    BookOpen,
    LayoutDashboard,
    LoaderCircle,
    LogOutIcon,
    PanelLeftClose,
    PanelLeftOpen,
    Store
} from 'lucide-react'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { Button } from './ui/button'
import { useAuth } from '../contexts/AuthContext'
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs'
import { useLanguage } from '../contexts/LanguageContext'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem
} from '@components/ui/dropdown-menu'
import { Notify } from '@/src/types/global'
import api from '../lib/axios'
import { cn } from '../lib/utils'
import { desktop } from '@renderer/lib/desktop'

const SERVER_URL = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, '') || 'https://toolsngon.com'
const STORE_URL = `${SERVER_URL}/store/`
const DOCS_URL = 'https://toolsngon-com.gitbook.io/docs/huong-dan-su-dung'

const toLucideIconName = (icon?: string | null): IconName | null => {
    if (!icon || icon.trim().startsWith('<')) return null
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

const MenuIcon = ({ icon }: { icon?: string | null }): React.ReactElement => {
    const iconName = toLucideIconName(icon)
    if (!iconName) return <BookOpen size={16} />

    return (
        <DynamicIcon
            name={iconName}
            size={16}
            className="shrink-0"
            fallback={() => <BookOpen size={16} className="shrink-0" />}
        />
    )
}

type SidebarProps = {
    collapsed: boolean
    onToggleCollapsed: () => void
}

export default function Sidebar({
    collapsed,
    onToggleCollapsed
}: SidebarProps): React.ReactElement {
    const { profiles, currentProfile, currentTab, setCurrentProfile, switchTab, addTab } =
        useProfiles()
    const { loadUserProducts, user, appSetting, logout } = useAuth()
    const { language, setLanguage, t } = useLanguage()
    const accountManagerLabel = t('sidebar.accountManager')
    const storeLabel = t('sidebar.accountStore')
    const docsLabel = t('sidebar.userGuide')
    const [loadingNotify, setLoadingNotify] = useState(false)
    const [openNotifications, setOpenNotifications] = useState(false)
    const [notifications, setNotifications] = useState<Notify[] | null>()
    const [appInfo, setAppInfo] = useState({
        device_name: '',
        os: '',
        app_version: ''
    })

    const handleSwitchToDashboard = async () => {
        if (currentProfile?.id !== '1') {
            setCurrentProfile('1')
            await loadUserProducts()
        }
        switchTab('1', '1')
    }

    const handleSwitchToStore = () => {
        const storeTabId = 'store'
        const defaultProfile = profiles.find((profile) => profile.id === '1')
        const hasStoreTab = defaultProfile?.tabs.some((tab) => tab.id === storeTabId)

        setCurrentProfile('1')
        if (!hasStoreTab) {
            addTab('1', {
                id: storeTabId,
                name: 'store',
                title: storeLabel,
                url: STORE_URL,
                currentUrl: STORE_URL,
                favicon: 'https://toolsngon.com/static/images/icon.png'
            })
            return
        }
        switchTab('1', storeTabId)
    }

    const handleSwitchToDocs = () => {
        const docsTabId = 'docs'
        const defaultProfile = profiles.find((profile) => profile.id === '1')
        const hasDocsTab = defaultProfile?.tabs.some((tab) => tab.id === docsTabId)

        setCurrentProfile('1')
        if (!hasDocsTab) {
            addTab('1', {
                id: docsTabId,
                name: 'docs',
                title: docsLabel,
                url: DOCS_URL,
                currentUrl: DOCS_URL,
                favicon: 'https://toolsngon-com.gitbook.io/~gitbook/icon?size=small&theme=light'
            })
            return
        }
        switchTab('1', docsTabId)
    }

    const getNotifications = async () => {
        setLoadingNotify(true)
        try {
            const fetchData = await api.get('/api/appdesktop/notifications/')
            setNotifications(fetchData.data)
        } catch {
            //
        } finally {
            setLoadingNotify(false)
        }
    }

    const getAppInfo = async (): Promise<void> => {
        const appInfo = await desktop.app.getInfo()
        setAppInfo(appInfo)
    }

    useEffect(() => {
        getAppInfo()
    }, [])

    useEffect(() => {
        if (currentProfile?.id === '1') {
            getNotifications()
            if (notifications && notifications.length > 0) {
                setOpenNotifications(true)
            }
        }
    }, [currentProfile?.id])

    useEffect(() => {
        if (openNotifications) {
            getNotifications()
        }
    }, [openNotifications])

    return (
        <div
            className={cn(
                'space-y-6 flex flex-col h-full navbar duration-300',
                collapsed && 'items-center'
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-2 px-2 pt-2 w-full h-9 group relative no-drag',
                    collapsed ? 'justify-center flex-col' : 'justify-between'
                )}
            >
                <div className={cn('flex items-center gap-2', collapsed ? 'pl-0 justify-center' : 'pl-3')}>
                    <img
                        src="https://toolsngon.com/static/images/icon.png"
                        className="size-5 object-cover rounded"
                        alt=""
                    />
                    {!collapsed && (
                        <div className="flex items-start gap-1">
                            <p className="text-[#5879bb] font-bold">Toolsngon</p>
                            <span className="text-xs text-slate-400"> {appInfo.app_version}</span>
                        </div>
                    )}
                </div>
                <Button
                    className={
                        collapsed
                            ? 'absolute top-1.5 hover:bg-white! size-9 opacity-0 group-hover:opacity-100 bg-white'
                            : ''
                    }
                    variant={'ghost'}
                    size={'icon-xs'}
                    onClick={onToggleCollapsed}
                    title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                >
                    {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
            </div>

            <div className="space-y-2 px-2 w-full">
                <p
                    className={cn(
                        'text-xs text-slate-400 px-3 font-medium',
                        collapsed && 'opacity-0 whitespace-nowrap'
                    )}
                >
                    {t('sidebar.navigation')}
                </p>
                <div className="space-y-1.5 w-full">
                    <Button
                        variant={'ghost'}
                        onClick={handleSwitchToDashboard}
                        className={cn(
                            'w-full rounded-lg hover:bg-blue-50! whitespace-nowrap',
                            collapsed ? 'justify-center px-0' : 'justify-start',
                            currentProfile?.id === '1' && currentTab?.id === '1'
                                ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-50! hover:text-blue-600!'
                                : 'text-slate-600 hover:text-slate-600 font-normal'
                        )}
                        title={accountManagerLabel}
                    >
                        <LayoutDashboard />
                        {!collapsed && accountManagerLabel}
                    </Button>
                    <Button
                        variant={'ghost'}
                        onClick={handleSwitchToStore}
                        className={cn(
                            'w-full rounded-lg hover:bg-blue-50! whitespace-nowrap',
                            collapsed ? 'justify-center px-0' : 'justify-start',
                            currentProfile?.id === '1' && currentTab?.id === 'store'
                                ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-50! hover:text-blue-600!'
                                : 'text-slate-600 hover:text-slate-600! font-normal'
                        )}
                        title={storeLabel}
                    >
                        <Store />
                        {!collapsed && storeLabel}
                    </Button>
                    <Button
                        variant={'ghost'}
                        onClick={handleSwitchToDocs}
                        className={cn(
                            'w-full rounded-lg hover:bg-blue-50! whitespace-nowrap',
                            collapsed ? 'justify-center px-0' : 'justify-start',
                            currentProfile?.id === '1' && currentTab?.id === 'docs'
                                ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-50! hover:text-blue-600!'
                                : 'text-slate-600 hover:text-slate-600! font-normal'
                        )}
                        title={docsLabel}
                    >
                        <BookOpen />
                        {!collapsed && docsLabel}
                    </Button>

                    {appSetting?.menus?.map((item) => (
                        <Button
                            asChild
                            key={item.label}
                            variant={'ghost'}
                            className={cn(
                                'w-full text-slate-600 font-normal rounded-lg hover:bg-blue-50! justify-between',
                                collapsed ? 'justify-center px-0' : 'justify-start px-3'
                            )}
                        >
                            <a href={item.url} target="_blank" rel="noreferrer" title={item.label}>
                                <MenuIcon icon={item.icon} />
                                {!collapsed && <span>{item.label}</span>}
                            </a>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 flex-1 flex-col px-2 w-full">
                {profiles.length > 1 && (
                    <>
                        {!collapsed && (
                            <p
                                className={cn(
                                    'text-xs text-slate-400 px-3 font-medium',
                                    collapsed && 'opacity-0 whitespace-nowrap'
                                )}
                            >
                                {t('sidebar.openApps')}
                            </p>
                        )}
                        <OpenApps collapsed={collapsed} />
                    </>
                )}
            </div>

            <div className={cn('py-2 space-y-3 w-full', collapsed ? 'px-2' : 'px-4')}>
                <Tabs value={language} onValueChange={(value) => setLanguage(value === 'en' ? 'en' : 'vi')}>
                    <TabsList className={cn('gap-2 w-full', collapsed && 'flex-col h-auto p-1')}>
                        <TabsTrigger
                            value="en"
                            aria-label={t('language.english')}
                            title={t('language.english')}
                            className={cn(
                                'min-h-8 data-[state=active]:shadow-none! data-[state=active]:bg-white!',
                                collapsed ? 'w-8 p-0' : 'w-fit pr-2'
                            )}
                        >
                            <img
                                src="https://flagicons.lipis.dev/flags/1x1/gb-eng.svg"
                                className="rounded-xs size-4"
                                alt={t('language.english')}
                            />
                            {!collapsed && <p>EN</p>}
                        </TabsTrigger>
                        <TabsTrigger
                            value="vi"
                            aria-label={t('language.vietnamese')}
                            title={t('language.vietnamese')}
                            className={cn(
                                'min-h-8 data-[state=active]:shadow-none! data-[state=active]:bg-white!',
                                collapsed ? 'w-8 p-0' : 'w-fit pr-2'
                            )}
                        >
                            <img
                                src="https://flagicons.lipis.dev/flags/1x1/vn.svg"
                                className="rounded-sm size-4"
                                alt={t('language.vietnamese')}
                            />
                            {!collapsed && 'VN'}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div
                    className={cn(
                        'flex items-center gap-2 w-full no-drag mb-2',
                        collapsed ? 'flex-col-reverse justify-center' : 'justify-between'
                    )}
                >
                    <div
                        className={cn('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center')}
                    >
                        <img src={user?.avatar_url} alt="" className="size-10 rounded-lg" />
                        {!collapsed && (
                            <p className="text-sm font-medium text-slate-600 truncate ">{user?.email}</p>
                        )}
                    </div>
                    {notifications && notifications?.length > 0 &&
                        <DropdownMenu
                            open={openNotifications}
                            onOpenChange={(open) => setOpenNotifications(open)}
                        >
                            <DropdownMenuTrigger
                                asChild
                                disabled={loadingNotify}
                                onClick={() => setOpenNotifications(!openNotifications)}
                            >
                                <div
                                    className={cn(
                                        loadingNotify && 'pointer-events-none cursor-not-allowed',
                                        'size-7 hover:bg-slate-200 relative duration-300 text-slate-600 hover:text-slate-800 rounded-md flex items-center justify-center',
                                        !!collapsed && 'hidden'
                                    )}
                                >
                                    {loadingNotify ? (
                                        <LoaderCircle className="animate-spin text-slate-800" size={16} />
                                    ) : (
                                        <BellIcon size={16} />
                                    )}
                                    {notifications && (
                                        <div className="absolute -top-2 right-2 text-xs rounded-full size-4 flex items-center justify-center bg-red-500 text-white">
                                            {notifications.length}
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                side="top"
                                className="w-80 overflow-y-auto max-h-[70vh] rounded-xl p-0"
                            >
                                <DropdownMenuGroup className="divide-y">
                                    {notifications ? (
                                        notifications.map((noti) => (
                                            <DropdownMenuItem key={noti.id} className="rounded-none p-1 group">
                                                <a
                                                    href={noti.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex flex-col gap-2 items-start p-2 hover:bg-slate-200 duration-150 rounded-lg"
                                                >
                                                    <div className=" text-slate-800 font-medium text-left line-clamp-2">
                                                        {noti.title}
                                                        <span className="absolute top-4 right-4 p-2 rounded-md shadow bg-white opacity-0 group-hover:opacity-100 duration-150">
                                                            <ArrowRight
                                                                size={14}
                                                                className="text-slate-800 group-hover:-rotate-45 duration-300"
                                                            />
                                                        </span>
                                                    </div>
                                                    <span className="text-slate-600 text-xs line-clamp-3">
                                                        {noti.description}
                                                    </span>
                                                    {noti.image && (
                                                        <div className="w-full aspect-video overflow-hidden rounded-md">
                                                            <img className="w-full h-full object-cover" src={noti.image} alt="" />
                                                        </div>
                                                    )}
                                                </a>
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <DropdownMenuItem className="p-4 flex items-center justify-center">
                                            {t('tabControl.noNotifications')}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    }
                    <Button
                        variant={'ghost'}
                        onClick={logout}
                        size={'icon-sm'}
                        title={(t('tabControl.logout'))}
                    >
                        <LogOutIcon />
                    </Button>
                </div>
            </div>
        </div >
    )
}
