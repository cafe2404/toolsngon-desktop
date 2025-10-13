import { CircleQuestionMark, LayoutGrid, LogOut, Store } from 'lucide-react'
import logoSvg from '../assets/logo.svg'
import { useTabs } from '../contexts/TabContext'
import { useAuth } from '../contexts/AuthContext'
import { JSX } from 'react'

export default function Sidebar(): JSX.Element {
    const { switchTab, currentTab, addTab } = useTabs()
    const { user, logout } = useAuth()
    const handleOpenTab = async (): Promise<void> => {
        await addTab({
            id: "2",
            name: 'introdution',
            title: 'Hướng dẫn',
            type: 'external',
            url: 'https://toolsngon.com/page/introduction',
            currentUrl: 'https://toolsngon.com/page/introduction',
        })
    }
    return (
        <div className="p-2 flex flex-col justify-between h-full bg-blue-700 relative">
            <div className='flex gap-2 flex-col items-center'>
                <a href='https://toolsngon.com' target='_blank' rel="noreferrer" className='w-7 py-2 flex items-center justify-center'>
                    <img src={logoSvg} alt="" />
                </a>
                <button onClick={() => switchTab("1")} className={`px-3 py-2 rounded-md text-blue-50 flex items-center justify-center duration-300 ${currentTab.id === '1' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
                    <LayoutGrid size={20} />
                </button>

                <button onClick={handleOpenTab} className={`px-3 py-2 rounded-md text-blue-50 flex items-center justify-center duration-300 ${currentTab.id === '2' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
                    <CircleQuestionMark size={20} />
                </button>
            </div>
            <div className='flex gap-2 py-2 flex-col items-center'>
                <a href='https://toolsngon.com/store' target='_blank' rel="noreferrer" className='px-3 py-2 rounded-md hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                    <Store size={20}></Store>
                </a>
                <div onClick={logout} className='px-3 py-2 rounded-md relative group hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                    <LogOut size={20}></LogOut>
                </div>
                <a href='https://toolsngon.com/settings' target='_blank' rel="noreferrer" className={`px-1 py-2 rounded-md text-blue-50 flex items-center justify-center`}>
                    <div className='w-7 flex aspect-square rounded-full overflow-hidden focus:outline-none hover:bg-blue-800 text-blue-50  items-center justify-center'>
                        <img className="object-cover w-full h-full" src={user?.avatar_url} alt="" />
                    </div>
                </a>
            </div>
        </div>
    )
}
