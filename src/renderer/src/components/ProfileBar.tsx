import { XIcon } from "lucide-react";
import { useProfiles } from "../contexts/ProfileContext";

const ProfileBar = (): React.JSX.Element => {
    const { profiles, currentProfile, removeProfile, setCurrentProfile } = useProfiles();
    const externalProfiles = profiles.filter(p => p.type === 'external')
    const handleRemoveProfile = (profileId: string): void => {
        removeProfile(profileId)
    }
    return (
        <div
            className={`flex flex-col gap-1.5 h-full duration-200 bg-white border-r border-slate-200`}
        >
            {/* 📁 Danh sách profiles */}
            <div className="flex-1 no-scrollbar px-2 py-4">
                <div
                    className="w-full flex flex-col gap-4"
                >
                    {externalProfiles.map((profile) => (
                        <div
                            onClick={() => {
                                setCurrentProfile(profile.id);
                            }}
                            key={profile.id}
                            className={`relative group cursor-pointer`}
                        >
                            <div className="h-full z-1 flex items-center justify-between gap-2">
                                <div className="size-12 relative min-w-12 rounded-md overflow-hidden hover:scale-105 duration-300">
                                    <img className="w-full h-full object-cover" src={profile.icon} />
                                    <div
                                        className={
                                            `text-[8px] flex items-center duration-300 text-white flex-col justify-end p-1 inset-0 absolute bg-gradient-to-t from-black via-black/50 to-transparent ${currentProfile && currentProfile.id === profile.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }`
                                        }
                                    >
                                        Đang mở
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveProfile(profile.id);
                                    }}
                                    className="absolute -top-2 left-4 bg-white hover:bg-slate-200 flex items-center size-4 border border-slate-200 rounded-full justify-center opacity-0 group-hover:opacity-100 duration-300"
                                >
                                    <XIcon size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default ProfileBar;
