import WebView from '../../components/WebView';
import { useProfiles } from '../../contexts/ProfileContext';

const TabContent = (): React.JSX.Element => {
    const { currentProfile, currentTab, profiles } = useProfiles()
    
    if (!currentProfile || !currentTab) return <></>;
    
    return (
        <div className='w-full h-full flex'>
            <div className="w-full h-full">
                {/* Render all React components from all profiles */}
                {profiles.map((profile) => 
                    profile.tabs.map((tab) => {
                        if (tab.component) {
                            return (
                                <div 
                                    className='h-full'
                                    key={`${profile.id}-${tab.id}`}
                                    style={{ 
                                        display: profile.id === currentProfile.id && tab.id === currentTab.id ? "block" : "none" 
                                    }}
                                >
                                    <tab.component />
                                </div>
                            )
                        }
                        return null
                    })
                )}
                
                {/* Render all WebView components from all profiles */}
                {profiles.map((profile) => 
                    profile.tabs.map((tab) => {
                        if (!tab.component) {
                            return (
                                <WebView 
                                    key={`${profile.id}-${tab.id}`} 
                                    tab={tab} 
                                    profileID={profile.id}
                                    isActive={profile.id === currentProfile.id && tab.id === currentTab.id}
                                />
                            )
                        }
                        return null
                    })
                )}
            </div>
        </div>
    );
};

export default TabContent;