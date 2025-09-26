import TabBar from '@components/TabBar'
import Sidebar from '@components/Sidebar'
import SearchModal from '@components/SearchModal'
import { Outlet } from 'react-router-dom'

function AppLayout(): React.JSX.Element {
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
        </div>
    )
}

export default AppLayout
