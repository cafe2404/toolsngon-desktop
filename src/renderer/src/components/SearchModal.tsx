/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Search } from 'lucide-react';
import { useSearch } from '@contexts/SearchContext'

const SearchModal = () => {
    const { isOpen, closeSearchModal } = useSearch();
    if (!isOpen) return null;
    return (
        <div className='fixed inset-0 flex items-center justify-center z-50 '>
            <div className='absolute inset-0 bg-white/50' onClick={closeSearchModal}>
            </div>
            <div className='w-full overflow-hidden flex flex-col max-w-md relative bg-white border border-slate-200 p-[1px] [box-shadow:_rgba(0,_0,_0,_0.4)_0px_22px_70px_4px] rounded-xl'>
                <div className='w-full h-full border border-slate-100 rounded-[11px] p-1'>
                    <div className='w-full border-b border-slate-200 flex items-center '>
                        <button className='px-4 py-3 flex items-center justify-center text-slate-800'>
                            <Search />
                        </button>
                        <input type="text" name="" id="" placeholder='Tìm kiếm tài khoản của bạn' className='flex-1 w-full pr-4 outline-none text-slate-800' />
                    </div>
                    <div className='p-2 flex flex-col gap-2  h-80 overflow-y-auto'>
                        {Array.from({ length: 12 }, (_, i) => (
                            <div key={i} className='p-2 flex items-center justify-between rounded-lg hover:bg-slate-200 duration-300'>
                                <div className='flex items-center gap-3'>
                                    <div className='size-6 rounded-full overflow-hidden'>
                                        <img className='w-full h-full object-cover' src="https://cdn.dribbble.com/userupload/42916868/file/original-1ad75ac7d2334ebe27a29627b343f38f.jpg?resize=752x&vertical=center" alt="" />
                                    </div>
                                    <div className='flex items-center gap-1 text-sm'>
                                        <p className='text-slate-800 '>ChatGPT Pro</p>
                                    </div>
                                </div>
                                <p className='text-slate-600 text-sm'>15/12/2024</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchModal;
