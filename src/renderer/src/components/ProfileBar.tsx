import { XIcon } from "lucide-react";
import { Reorder, motion } from "framer-motion";
import { useProfiles } from "../contexts/ProfileContext";
import { MouseEvent } from "react";

const ProfileBar = (): React.JSX.Element => {
    const { profiles, currentProfile, setCurrentProfile, setProfiles, removeProfile } = useProfiles();
    const externalProfiles = profiles.filter(p => p.type === 'external')
    const isOpen = true;
    const onReorder = (newOrder): void => {
        setProfiles(newOrder);
    };

    const handleRemoveProfile = (profileId: string): void => {
        removeProfile(profileId)
    }

    const onWheelHorizontal = (e: React.WheelEvent<HTMLDivElement>): void => {
        const el = e.currentTarget;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            el.scrollLeft += e.deltaY;
        }
    };

    const handleMouseDown = (e: MouseEvent, profileId: string): void => {
        if (e.button === 1) {
            e.stopPropagation();
            handleRemoveProfile(profileId);
        }
    };

    return (
        <motion.div
            transition={{ type: "tween", duration: 0.05, ease: "easeInOut" }}
            className={`flex flex-col gap-1.5 h-full duration-200 w-48 min-w-48 bg-white border-r border-slate-200`}
        >
            {/* 📋 Tiêu đề + nút menu */}
            <div className={`flex items-center justify-between ${isOpen ? "pr-2 pl-4 " : 'px-2'} pt-4 mb-1.5`}>
                <motion.h3
                    initial={false}
                    animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                    className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                >
                    Tài khoản
                </motion.h3>
            </div>

            {/* 📁 Danh sách profiles */}
            <div className="flex-1 no-scrollbar px-2" onWheel={onWheelHorizontal}>
                <Reorder.Group
                    layout="position"
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 30,
                    }}
                    axis="y"
                    values={profiles}
                    onReorder={onReorder}
                    className="w-full flex flex-col gap-2"
                >
                    {externalProfiles.map((profile) => (
                        <Reorder.Item
                            value={profile}
                            key={profile.id}
                            onMouseDown={(e) => handleMouseDown(e, profile.id)}
                            onPointerDown={() => setCurrentProfile(profile.id)}
                            layout
                            className={`relative ${currentProfile && currentProfile.id === profile.id
                                ? "bg-slate-200"
                                : "hover:bg-slate-200 duration-150"
                                } rounded-lg p-2`}
                        >
                            <motion.div
                                layout
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="h-full relative z-1 flex items-center justify-between rounded-lg gap-2 w-full">
                                    <div className="flex items-center gap-2 text-xs">
                                        <img className="size-4 min-w-4 object-cover rounded-sm" src={profile.icon} />
                                        <motion.span
                                            initial={false}
                                            animate={{
                                                opacity: isOpen ? 1 : 0,
                                                width: isOpen ? "auto" : 0,
                                            }}
                                            className="line-clamp-1 w-full text-left overflow-hidden"
                                        >
                                            {profile.name}
                                        </motion.span>
                                    </div>
                                    <motion.button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveProfile(profile.id);
                                        }}
                                        className="flex items-center justify-center min-w-4 size-4 rounded-full duration-300"
                                    >
                                        <XIcon size={14} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </motion.div>
    );
};

export default ProfileBar;
