/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Loader2, Plus, XIcon } from 'lucide-react'
import { useProfiles } from '@renderer/contexts/ProfileContext'
import { Reorder, motion } from 'framer-motion'
import React, { useMemo, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const TabBar = () => {
  const { t } = useLanguage()
  const { switchTab, currentProfile, currentTab, closeTab, updateProfile, addTab } = useProfiles()
  // Memoize tabs to prevent unnecessary re-renders
  const allTabs = useMemo(() => currentProfile?.tabs || [], [currentProfile])
  const isIconOnly = allTabs.length > 9

  const onReorder = useCallback(
    (newOrder: typeof allTabs): void => {
      if (!currentProfile) return
      // Update the current profile with new tab order
      updateProfile(currentProfile.id, { tabs: newOrder })
    },
    [currentProfile, updateProfile]
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent, tabId: string): void => {
      if (!currentProfile) return
      if (e.button === 1) {
        e.stopPropagation()
        closeTab(currentProfile.id, tabId)
      }
    },
    [currentProfile, closeTab]
  )

  const handleAddNewTab = useCallback(() => {
    if (!currentProfile) return
    // Add a new empty tab
    const newTabId = `tab_${Date.now()}`
    const newTab = {
      id: newTabId,
      name: 'new-tab',
      title: t('tabBar.newTab'),
      url: 'https://www.google.com',
      currentUrl: 'https://www.google.com',
      favicon: 'https://www.google.com/favicon.ico'
    }
    addTab(currentProfile.id, newTab)
  }, [currentProfile, addTab, t])
  if (!currentProfile) return <></>
  if (!currentProfile.account?.is_create_tab) return <></>
  return (
    <div className="box-border flex h-11 w-full min-w-0 items-center gap-1.5 overflow-hidden bg-slate-100 py-1.5 pl-2 pr-36 navbar">
      {allTabs.length > 0 && currentProfile.id !== '1' ? (
        <>
          <div className="min-w-0 flex-1 overflow-hidden no-drag">
            <Reorder.Group
              layout="position"
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 30
              }}
              axis="x"
              values={allTabs}
              onReorder={onReorder}
              className="flex w-full max-w-full min-w-0 items-center gap-1.5 overflow-hidden"
            >
              {allTabs.map((tab) => {
                const isActive = currentTab && currentTab.id === tab.id

                return (
                  <Reorder.Item
                    value={tab}
                    key={tab.id}
                    onMouseDown={(e: React.MouseEvent) => handleMouseDown(e.nativeEvent, tab.id)}
                    onPointerDown={() => switchTab(currentProfile.id, tab.id)}
                    layout
                    className={`relative ${
                      isActive ? 'bg-white' : 'hover:bg-slate-200 duration-150'
                    } group h-8 min-w-0 max-w-44 flex-[0_1_11rem] rounded-lg px-2 no-drag`}
                  >
                    <motion.div
                      layout
                      className="h-full"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="h-full relative z-1 flex items-center justify-between w-full rounded-lg gap-1.5 overflow-hidden">
                        <div
                          className={`flex items-center gap-2 flex-1 min-w-0 ${
                            isIconOnly ? 'justify-center' : 'justify-center lg:justify-start'
                          }`}
                        >
                          {tab.isLoading ? (
                            <Loader2 className="size-4 shrink-0 animate-spin" />
                          ) : (
                            <img
                              className="size-4 shrink-0 object-cover rounded-sm"
                              src={tab.favicon}
                              alt=""
                            />
                          )}
                          <div
                            className={`truncate text-left text-xs w-full ${
                              isIconOnly ? 'hidden' : 'hidden lg:block'
                            }`}
                          >
                            {tab.title}
                          </div>
                        </div>
                        {allTabs.length > 1 && tab.id !== '1' && !isIconOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              closeTab(currentProfile.id, tab.id)
                            }}
                            className="hidden size-4 min-w-4 shrink-0 items-center justify-center rounded-full duration-300 hover:bg-slate-200 group-hover:flex lg:flex"
                          >
                            <XIcon size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </Reorder.Item>
                )
              })}
              {currentProfile.account?.is_create_tab && currentProfile?.id !== '1' && (
                <button
                  onClick={handleAddNewTab}
                  className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-lg duration-150 hover:bg-slate-200"
                >
                  <Plus size={16}></Plus>
                </button>
              )}
            </Reorder.Group>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-8 w-full text-sm font-medium">
          {currentTab?.title}
        </div>
      )}
    </div>
  )
}
export default TabBar
