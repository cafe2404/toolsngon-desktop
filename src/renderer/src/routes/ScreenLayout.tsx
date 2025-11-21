/* eslint-disable @typescript-eslint/explicit-function-return-type */
import logoSvg from '../assets/logo_2.svg'
import { Outlet } from 'react-router-dom';
import { Toaster } from "@components/ui/sonner"

const ScreenLayout = () => {
    return (
        <div className='w-screen h-screen flex items-center justify-center bg-white text-center relative'>
            <div className='absolute top-0 left-0 w-full pr-36'>
                <div className="w-full h-10 navbar"></div>
            </div>
            <div className='absolute top-10 left-10 w-10 h-10 overflow-hidden'>
                <img src={logoSvg} alt="" />
            </div>
            <div className="flex flex-col gap-6 items-center justify-center">
                <Outlet />
            </div>
            <p className='absolute bottom-4 text-xs text-slate-600'>Do not sell or share my personal info</p>
            <Toaster position='top-center' />
        </div>
    )
}

export default ScreenLayout;
