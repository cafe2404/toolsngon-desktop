import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfiles } from '../../contexts/ProfileContext';

const DeepLinkListener = (): null => {
    const { userProducts } = useAuth()
    const { addTab, addProfile, setCurrentProfile, profiles, injectScript } = useProfiles()
    
    useEffect(() => {
        const unsubscribe = window.api.onDeepLink(async (url) => {
            const parsed = new URL(url)
            console.log(parsed.href)
            if (parsed.host === 'open-tab') {
                const accountId = parsed.searchParams.get('accountId')
                console.log(accountId)
                const item = userProducts.find(product => product.account_group?.accounts.find(account => account.id === Number(accountId)))
                if (item) {
                    const account = item.account_group?.accounts.find(account => account.id === Number(accountId))
                    const tabId = `${item.product.slug}_${account?.id ?? '0'}`
                    
                    // Check if profile already exists for this product
                    const existingProfile = profiles.find(profile => 
                        profile.id === `profile_${item.product.slug}_${account?.id ?? '0'}`
                    )
                    
                    if (existingProfile) {
                        // Switch to existing profile
                        setCurrentProfile(existingProfile.id)
                        
                        // Check if tab already exists in this profile
                        const existingTab = existingProfile.tabs.find(tab => tab.id === tabId)
                        if (existingTab) {
                            // Tab exists, just switch to it (no need to add again)
                            return
                        } else {
                            // Add tab to existing profile
                            await addTab(existingProfile.id, {
                                id: tabId,
                                name: item.product.title,
                                title: item.product.title,
                                url: item.product.url,
                                currentUrl: item.product.url,
                                favicon: item.product.logo_url,
                                account: account,
                            })
                        }
                    } else {
                        // Create new profile for this product
                        const newProfileId = `profile_${item.product.slug}_${account?.id ?? '0'}`
                        const newProfile = {
                            id: newProfileId,
                            icon: item.product.logo_url,
                            partition: `persist:profile-${newProfileId}`,
                            tabs: [],
                            currentTabId: undefined,
                            type: "external" as const,
                            name: item.product.title + ` (${account?.id})`,
                            account: account
                        }
                        addProfile(newProfile)
                        setCurrentProfile(newProfileId)
                        await addTab(newProfileId, {
                            id: tabId,
                            name: item.product.title,
                            title: item.product.title,
                            url: item.product.url,
                            currentUrl: item.product.url,
                            favicon: item.product.logo_url,
                            account: account,
                        })
                    }

                    // Handle Chrome opening or script injection
                    if (account?.open_chrome) {
                        await window.api.browserView.openChrome(tabId, item.product.url, account)
                        return
                    }

                    if (account?.script) {
                        await injectScript(tabId, account.script)
                    }
                }
            }
        })
        return () => { try { (unsubscribe as unknown as (() => void) | undefined)?.() } catch { /* noop */ } }
    }, [userProducts, addTab, addProfile, setCurrentProfile, profiles, injectScript])
    return null
}

export default DeepLinkListener;
