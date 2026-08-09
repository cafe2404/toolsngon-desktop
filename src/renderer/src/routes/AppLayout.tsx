import { Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import api from '../lib/axios'
import { useProfiles } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import { Toaster } from "@components/ui/sonner"
import TabControl from '../components/TabControl'
import TabBar from '../components/TabBar'
import TabInfo from '../components/TabInfo'
import ChatPanel from '../components/ChatPanel'
import { usePanel } from '../contexts/PanelContext'
import Sidebar from '../components/Sidebar'
function AppLayout(): React.JSX.Element {
    const { profiles, currentProfile } = useProfiles()
    const { isOpen, panelType } = usePanel()
    const { user } = useAuth()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const profilesRef = useRef(profiles);
    const userRef = useRef(user);
    useEffect(() => {
        profilesRef.current = profiles;
    }, [profiles]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!userRef.current?.id) return
            api.post("/api/heartbeat/", {
                user_id: userRef?.current?.id,
                profiles: profilesRef.current,
            }).catch(() => {
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);
    return (
        <div className="w-screen h-screen bg-slate-100 flex overflow-y-hidden">
            <div className={`${sidebarCollapsed ? "w-16" : "w-62"} duration-300 shrink-0`}>
                <div className="w-full bg-white h-full border-r border-r-slate-200">
                    <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)} />
                </div>
            </div>
            <div className="h-full flex flex-col flex-1">
                <TabBar />
                <TabControl />
                <div className="flex h-full overflow-hidden">
                    <div className="w-full h-full">
                        <Outlet />
                    </div>
                    <ChatPanel isVisible={isOpen && panelType === 'chat'} />
                    {currentProfile && currentProfile.id !== '1' && isOpen && panelType === 'info' && user?.is_superuser &&
                        <TabInfo />
                    }
                </div>
                <Toaster />
            </div>
        </div>
    )
}

export default AppLayout
