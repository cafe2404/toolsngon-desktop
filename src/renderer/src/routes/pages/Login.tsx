/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@renderer/lib/axios'
import { useAuth } from '@contexts/AuthContext'
import { toast } from 'sonner'

export default function Login() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { isAuthenticated } = useAuth()
    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard')
    }, [isAuthenticated, navigate])
    const createSession = async () => {
        try {
            setLoading(true)
            const res = await api.post("/api/app_auth/create_session/")
            const session_id = res.data.session_id
            window.api.openExternal(`${import.meta.env.VITE_SERVER_URL}/app_auth/${session_id}/grant/?desktop_protocol=toolsngon`)
        }
        catch (err: any) {
            const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || "Lỗi không xác định"
            console.log("err", errorMsg)
            const toastId = toast.error(errorMsg, {
                duration: Infinity,
                action: {
                    label: "Đóng",
                    onClick: () => toast.dismiss(toastId),
                },
            })
            setLoading(false)
            alert(
                '❌ ' +
                JSON.stringify(err.toJSON(), null, 2)
            )
        }
    }
    useEffect(() => {
        const unsubscribe = window.api.onDeepLink((url) => {
            const parsed = new URL(url)
            if (parsed.host === 'auth') {
                navigate("/auth/callback" + parsed.search)
            }
            setLoading(false)
        })
        return () => { try { (unsubscribe as unknown as (() => void) | undefined)?.() } catch { /* noop */ } }
    }, [navigate])

    return (
        <>
            {loading ?
                <>
                    <h1 className='text-slate-800 text-2xl font-medium'>
                        Tiếp tục trên trình duyệt <br />
                        và hoàn tất đăng nhập
                    </h1>
                    <div className="flex items-center gap-1 text-xs">
                        <p className='text-slate-600'>Không thấy tab trình duyệt? <button onClick={() => setLoading(false)} className='hover:underline text-blue-600'>Thử lại</button></p>
                    </div>
                </>
                :
                <>
                    <h1 className='text-slate-800 text-2xl font-medium'>
                        Đăng nhập hoặc tạo <br />
                        tài khoản để<br />
                        bắt đầu
                    </h1>
                    <button onClick={createSession} className='px-4 py-2 bg-blue-700 gap-1 cursor-pointer text-lg font-medium group rounded-lg hover:bg-blue-800 text-blue-50 flex items-center justify-center duration-300'>
                        <span className='w-0 opacity-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto duration-300'>
                            <ArrowRight size={20}></ArrowRight>
                        </span>
                        Tiếp tục với trình duyệt
                    </button>
                    <div className="flex items-center gap-1 text-xs">
                        <p className='text-slate-600'>Chưa có tài khoản? <a target='_blank' rel="noreferrer" href={`${import.meta.env.VITE_SERVER_URL}/signup`} className='hover:underline text-blue-600'>Đăng ký ngay</a></p>
                    </div>
                </>
            }
            <p className='absolute bottom-4 text-xs text-slate-600'>Do not sell or share my personal info</p>
        </>
    )
}
