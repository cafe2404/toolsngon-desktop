import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import api from '../lib/axios'
import { useProfiles } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import { Toaster } from "@components/ui/sonner"
import ProfileBar from '../components/ProfileBar'
import TabControl from '../components/TabControl'
import TabBar from '../components/TabBar'
import TabInfo from '../components/TabInfo'
import ChatPanel from '../components/ChatPanel'
import { usePanel } from '../contexts/PanelContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
function AppLayout(): React.JSX.Element {
    const { profiles, currentProfile } = useProfiles()
    const { isOpen, panelType } = usePanel()
    const { user } = useAuth()
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
        <div className="w-screen h-screen bg-slate-200 flex overflow-y-hidden flex-col">
            <div className="flex items-center gap-1.5 w-full py-1.5 bg-slate-200 navbar pl-2 pr-36">
                <TabBar />
                <Tabs defaultValue="vn">
                    <TabsList className='h-8 gap-2 bg-slate-200'>
                        <TabsTrigger value="en" className='p-1.5 w-fit data-[state=active]:shadow-none! data-[state=active]:bg-white! pr-2'>
                            <img src="https://flagicons.lipis.dev/flags/1x1/gb-eng.svg" className='rounded-xs size-4' alt="" />
                            <p>EN</p>
                        </TabsTrigger>
                        <TabsTrigger value="vn"  className='p-1.5 w-fit data-[state=active]:shadow-none! data-[state=active]:bg-white! pr-2'>
                            <img src="https://flagicons.lipis.dev/flags/1x1/vn.svg" className='rounded-sm size-4' alt="" />
                            VN
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <TabControl />
            <div className="flex w-full h-full overflow-hidden">
                {profiles.length > 1 &&
                    <ProfileBar></ProfileBar>
                }
                <div className="w-full h-full overflow-hidden bg-white">
                    <Outlet />
                </div>
                <ChatPanel isVisible={isOpen && panelType === 'chat'} />
                {currentProfile && currentProfile.id !== '1' && isOpen && panelType === 'info' && user?.is_superuser &&
                    <TabInfo />
                }
            </div>
            <Toaster />
        </div>
    )
}

export default AppLayout
