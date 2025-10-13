/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth } from "@contexts/AuthContext"
import { LoaderCircle } from "lucide-react"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

export default function AuthCallback() {
    const [searchParams] = useSearchParams()
    const code = searchParams.get("code")
    const sessionId = searchParams.get("session_id")
    const navigate = useNavigate()
    const { loginWithCode } = useAuth()
    const checkAuth = async (): Promise<void> => {
        try {

            await loginWithCode({
                session_id: sessionId!,
                code: code!
            })
            navigate('/dashboard')
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
            navigate('/login')
        }
    }
    useEffect(() => {
        console.log(code, sessionId)
        if (code && sessionId) {
            void checkAuth();
        }
    }, [code, sessionId])

    return <>
        <h1 className="font-medium text-slate-800">Đang tải...</h1>
        <LoaderCircle className="animate-spin  text-slate-800" size={20}></LoaderCircle>
    </>
}
