/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useProfiles } from "@renderer/contexts/ProfileContext";
import { BugIcon, LoaderCircle, MousePointerClick, SquareArrowOutUpRight } from "lucide-react";
import ReactPlayer from "react-player";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog"

export default function Introduction() {
    const { currentTab } = useProfiles()

    return (
        <div className={`w-full flex gap-12 flex-col p-24 h-full items-center justify-center overflow-y-auto`} style={{ display: currentTab?.id === "2" ? "flex" : "none" }}   >
            <div className="flex flex-col container mx-auto text-center">
                <h1 className="text-4xl whitespace-nowrap font-medium text-slate-800 mb-4">Hướng dẫn sử dụng Toolsngon</h1>
                <h1 className="tfont-medium text-slate-600 mb-16">Vui lòng xem kĩ hướng dẫn, nếu gặp vấn đề gì vui lòng liên hệ admin.</h1>
                <div className="grid grid-cols-4 gap-6">
                    <div className="relative w-full white rounded-lg border-white/50 h-full">
                        <div className="h-24 w-24 flex items-center justify-center bg-blue-600 rounded-b-full absolute -top-4 left-1/2 -translate-x-1/2">
                        </div>
                        <div className=" h-full flex w-full flex-col gap-4 text-slate-800 relative backdrop-blur-xs bg-white/10 p-5 text-center border border-slate-200 rounded-lg">
                            <p className="text-white text-4xl font-bold">1</p>
                            <MousePointerClick className="mx-auto mt-4 text-blue-600" size={60}></MousePointerClick>
                            <h2 className="text-xl font-semibold ">Chọn tài khoản</h2>
                            <p className="text-slate-600">Chọn tài khoản cần đăng nhập trong danh sách tài khoản được chia sẻ của bạn</p>
                        </div>
                    </div>

                    <div className="relative w-full white rounded-lg border-white/50 h-full">
                        <div className="h-24 w-24 flex items-center justify-center bg-purple-600 rounded-b-full absolute -top-4 left-1/2 -translate-x-1/2">
                        </div>
                        <div className=" h-full flex w-full flex-col gap-4 text-slate-800 relative backdrop-blur-xs bg-white/10 p-5 text-center border border-slate-200 rounded-lg">
                            <p className="text-white text-4xl font-bold">2</p>
                            <SquareArrowOutUpRight className="mx-auto mt-4 text-purple-600" size={60}></SquareArrowOutUpRight>
                            <h2 className="text-xl font-semibold ">Mở tab</h2>
                            <p className="text-slate-600">Ấn nút mở để tạo tab đã đăng nhập tài khoản</p>
                        </div>
                    </div>
                    <div className="relative w-full white rounded-lg border-white/50 h-full">
                        <div className="h-24 w-24 flex items-center justify-center bg-green-600 rounded-b-full absolute -top-4 left-1/2 -translate-x-1/2">
                        </div>
                        <div className=" h-full flex w-full flex-col gap-4 text-slate-800 relative backdrop-blur-xs bg-white/10 p-5 text-center border border-slate-200 rounded-lg">
                            <p className="text-white text-4xl font-bold">3</p>
                            <LoaderCircle className="mx-auto mt-4 text-green-600" size={60}></LoaderCircle>
                            <h2 className="text-xl font-semibold ">Chờ đợi</h2>
                            <p className="text-slate-600">Đợi vài giây cho đến khi tài khoản được đăng nhập</p>
                        </div>
                    </div>
                    <div className="relative w-full white rounded-lg border-white/50 h-full">
                        <div className="h-24 w-24 flex items-center justify-center bg-red-600 rounded-b-full absolute -top-4 left-1/2 -translate-x-1/2">
                        </div>
                        <div className=" h-full flex w-full flex-col gap-4 text-slate-800 relative backdrop-blur-xs bg-white/10 p-5 text-center border border-slate-200 rounded-lg">
                            <p className="text-white text-4xl font-bold">4</p>
                            <BugIcon className="mx-auto mt-4 text-red-600" size={60}></BugIcon>
                            <h2 className="text-xl font-semibold ">Vấn đề</h2>
                            <p className="text-slate-600">Nếu tài khoản chưa được đăng nhập ấn nút <strong>&lsquo;Đăng nhập lại&lsquo;</strong> để đăng nhập lại. Nếu không thanh công hãy gọi hỗ trợ</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center mt-12">
                    <Dialog>
                        <form>
                            <DialogTrigger asChild>
                                <button className="flex items-center justify-center py-2 px-4 bg-slate-50 hover:bg-slate-100 rounded-md font-medium">Xem video hướng dẫn</button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[70vw] !w-[70vw]">
                                <DialogHeader>
                                    <DialogTitle>Video hướng dẫn</DialogTitle>
                                    <DialogDescription>
                                        Video hướng dẫn sử dụng app toolsngon.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="aspect-video flex items-center justify-center flex-1 rounded-lg overflow-hidden">
                                    <ReactPlayer width={'100%'} autoPlay height={'100%'} src='https://www.youtube.com/watch?v=LXb3EKWsInQ' controls className="w-full h-full" />
                                </div>
                            </DialogContent>
                        </form>
                    </Dialog>
                </div>
            </div>

        </div>
    )
}
