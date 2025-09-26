/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useSearch } from '@renderer/contexts/SearchContext'
import { Bolt, LayoutGrid, Plus, Store } from 'lucide-react'
import logoSvg from '../assets/logo.svg'
import { UserDropdownMenu } from './UserDropdownMenu'
import { useTabs } from '../contexts/TabContext'

export default function Sidebar() {
    const { openSearchModal } = useSearch()
    const { switchTab } = useTabs()
    return (
        <div className="p-2 flex flex-col justify-between h-full bg-blue-700 relative">
            <div className='flex gap-2 flex-col items-center'>
                <div className='w-7 py-2 flex items-center justify-center'>
                    <img src={logoSvg} alt="" />
                </div>
                <button onClick={() => switchTab("1")} className='px-3 py-2 rounded-md hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                    <LayoutGrid size={20} />
                </button>
                <button onClick={openSearchModal} className='px-3 py-2 rounded-md hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                    <Plus size={20} />
                </button>
            </div>
            <div className='flex gap-2 py-2 flex-col items-center'>
                <button className='px-3 py-2 rounded-md hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                    <Store size={20}></Store>
                </button>
                <button className='px-3 py-2 rounded-md hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                    <Bolt size={20}></Bolt>
                </button>
              
                <UserDropdownMenu  />
            </div>
        </div>
    )
}
