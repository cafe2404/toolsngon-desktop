import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import api from '../lib/axios'
import { useTabs } from '../contexts/TabContext'
import { useAuth } from '../contexts/AuthContext'
import { Toaster } from "@components/ui/sonner"
import Tablist from '../components/Tablist'
import TabTitle from '../components/ui/TabTitle'
import TabControl from '../components/TabControl'

function AppLayout(): React.JSX.Element {
    const { tabs } = useTabs()
    const { user } = useAuth()
    const tabsRef = useRef(tabs);
    const userRef = useRef(user);
    useEffect(() => {
        tabsRef.current = tabs;
    }, [tabs]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!userRef.current?.id) return
            api.post("/api/heartbeat/", {
                user_id: userRef?.current?.id,
                tabs: tabsRef.current,
            }).catch(() => {
                // không cần xử lý lỗi ở đây nếu chỉ tracking
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);
    return (
        <div className="w-screen h-screen bg-white flex overflow-y-hidden flex-col">
            <TabTitle />
            <TabControl />
            <div className="flex flex-1 w-full border-t border-slate-200 overflow-y-auto">
                {tabs.filter((t) => t.type === "external").length > 0 &&
                    <Tablist></Tablist>
                }
                <div className="w-full overflow-hidden h-full bg-white">
                    <Outlet />
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default AppLayout
