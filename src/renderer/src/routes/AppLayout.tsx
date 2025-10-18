import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import api from '../lib/axios'
import { useProfiles } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import { Toaster } from "@components/ui/sonner"
import ProfileBar from '../components/ProfileBar'
import TabControl from '../components/TabControl'
import TabBar from '../components/TabBar'

function AppLayout(): React.JSX.Element {
    const { profiles } = useProfiles()
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
            <TabBar />
            <TabControl />
            <div className="flex w-full h-full overflow-hidden">
                {profiles.length > 1 &&
                    <ProfileBar></ProfileBar>
                }
                <div className="w-full h-full overflow-hidden bg-white">
                    <Outlet />
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default AppLayout
