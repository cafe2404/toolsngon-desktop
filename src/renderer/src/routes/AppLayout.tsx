import TabBar from '@components/TabBar'
import Sidebar from '@components/Sidebar'
import SearchModal from '@components/SearchModal'
import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import api from '../lib/axios'
import { useTabs } from '../contexts/TabContext'
import { useAuth } from '../contexts/AuthContext'
import { Toaster } from "@components/ui/sonner"

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
        console.log(user)
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
        <div className="w-full h-screen bg-white flex">
            <SearchModal></SearchModal>
            <Sidebar></Sidebar>
            <div className="flex flex-1 overflow-y-hidden flex-col">
                <TabBar />
                <div className="w-full overflow-hidden h-full bg-white">
                    <Outlet />
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default AppLayout
