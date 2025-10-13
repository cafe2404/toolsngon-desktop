import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTabs } from '../../contexts/TabContext';



const DeepLinkListener = (): null => {
    const { userProducts } = useAuth()
    const { addTab, injectScript } = useTabs()
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
                    await addTab({
                        id: tabId,
                        name: item.product.title,
                        title: item.product.title,
                        type: 'external',
                        url: item.product.url,
                        currentUrl: item.product.url,
                        favicon: item.product.logo_url,
                        account: account,
                    })
                    if (account?.script) {
                        await injectScript(tabId, account)
                    }
                }
            }
        })
        return () => { try { (unsubscribe as unknown as (() => void) | undefined)?.() } catch { /* noop */ } }
    }, [userProducts, addTab, injectScript])
    return null
}

export default DeepLinkListener;
