import { XIcon } from 'lucide-react'
import { useProfiles } from '../contexts/ProfileContext'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

const OpenApps = ({ collapsed = false }: { collapsed?: boolean }): React.JSX.Element => {
  const { profiles, removeProfile, setCurrentProfile, currentProfile } = useProfiles()
  const externalProfiles = profiles.filter((p) => p.type === 'external')
  const handleRemoveProfile = (profileId: string): void => {
    removeProfile(profileId)
  }
  return (
    <div className={`flex flex-col gap-1.5 duration-200 overflow-y-hidden w-full`}>
      <div className="w-full flex flex-col gap-2  h-full overflow-y-auto">
        {externalProfiles.map((profile) => (
          <Button
            onClick={() => {
              setCurrentProfile(profile.id)
            }}
            asChild
            key={profile.id}
            variant={'ghost'}
            className={cn(
              'w-full no-drag h-fit group rounded-lg line-clamp-1 whitespace-nowrap',
              collapsed ? 'px-0 justify-center' : 'px-3 justify-between',
              currentProfile && currentProfile.id === profile.id
                ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-50! hover:text-blue-600'
                : 'text-slate-600 font-normal hover:text-slate-600!'
            )}
            title={profile.name}
          >
            <div
              className={`h-full z-1 flex items-center w-full flex-1 gap-2 ${collapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2">
                <div className="size-4 relative">
                  <img className="w-full h-full object-cover rounded" src={profile.icon} />
                </div>
                {!collapsed && <p className=" text-sm">{profile.name}</p>}
              </div>
              {!collapsed && (
                <Button
                  className="opacity-0 group-hover:opacity-100"
                  variant={'ghost'}
                  size={'icon-xs'}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemoveProfile(profile.id)
                  }}
                >
                  <XIcon />
                </Button>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default OpenApps
