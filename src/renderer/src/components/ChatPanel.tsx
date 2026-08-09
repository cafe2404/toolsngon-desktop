import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpIcon, BadgeCheck, CameraIcon, FileTextIcon, ImagePlusIcon, PanelRightCloseIcon, VideoIcon, XIcon } from "lucide-react"
import { useProfiles } from "../contexts/ProfileContext"
import { useAuth } from "../contexts/AuthContext"
import { usePanel } from "../contexts/PanelContext"
import { Button } from "./ui/button"
import { UserProduct } from "src/types/global"
import logoSvg from '../assets/logo_2.svg'
import api from "../lib/axios"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "./ui/tooltip"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"
import { useLanguage } from "../contexts/LanguageContext"


type ChatActionType = 'open-guide-video' | 'open-support-guide' | 'capture-screenshot' | 'support-flow' | 'support-menu'
type SupportButtonAction = 'next' | 'open_url'
type DesktopSupportAction =
    | 'reload'
    | 'reload_current_tab'
    | 'close_app'
    | 'close_current_app'
    | 'close_current_tab'
    | 'reinject_cookies'
    | 'inject_cookies'
    | 'go_dashboard'
    | 'back_dashboard'
    | 'navigate'

type ChatAction = {
    id: string
    type: ChatActionType
    label: string
    buttonId?: number
    action?: SupportButtonAction
    metadata?: Record<string, unknown>
}

type ChatSender = 'user' | 'ai' | 'agent' | 'system'

type ChatMessage = {
    id: string
    role: 'support' | 'user' | 'status'
    sender?: ChatSender
    text: string
    screenshot?: string
    imageUrl?: string
    attachmentUrl?: string
    guideTitle?: string
    guideDescription?: string
    guideContentMarkdown?: string
    guideProductTitle?: string
    guideProductLogoUrl?: string
    guideUrl?: string
    actions?: ChatAction[]
}

type SupportButton = {
    id: number
    label: string
    action: SupportButtonAction
    metadata?: Record<string, unknown>
}

type SupportNode = {
    id: number
    key: string
    type: 'message' | 'question' | 'answer' | 'action' | 'end'
    message: string
    buttons: SupportButton[]
}

type SupportConversation = {
    id: number
    status: 'active' | 'ai_active' | 'waiting_for_agent' | 'agent_active' | 'closed' | 'ended'
    product?: number | null
    product_slug?: string
    product_title?: string
    product_logo_url?: string
}

type SupportGuide = {
    id: number
    title: string
    description?: string
    content_markdown?: string
    file_url?: string
    url?: string
    product_title?: string
    product_logo_url?: string
}

type SupportFlowRuntime = {
    id: number
    name: string
    event: string
    product?: number | null
    product_slug?: string
    product_title?: string
    guide?: SupportGuide | null
}

type SupportFlowResponse = {
    conversation: SupportConversation
    flow?: SupportFlowRuntime | null
    node?: SupportNode | null
    button?: SupportButton
    message?: SupportChatMessageResponse
}

type SupportConversationMessagesResponse = {
    conversation: SupportConversation | null
    messages: SupportChatMessageResponse[]
    pagination: {
        has_more: boolean
        oldest_id: number | null
    }
}

type SupportChatMessageResponse = {
    id: number
    sender: ChatSender
    message_type: 'text' | 'image' | 'file' | 'link' | 'guide' | 'system'
    text: string
    attachment_url?: string
    guide_title?: string
    guide_description?: string
    guide_content_markdown?: string
    guide_product_title?: string
    guide_product_logo_url?: string
    guide_url?: string
    guide_file_url?: string
}

type SupportSocketEvent =
    | {
        type: 'message.created'
        conversation: SupportConversation
        message: SupportChatMessageResponse
    }
    | {
        type: 'conversation.updated'
        conversation: SupportConversation
    }

type SupportTarget = {
    productSlug: string
    appName: string
    appLogo?: string
    product?: UserProduct
}

type ChatPanelProps = {
    isVisible: boolean
}

type SupportHydrationResult = 'loaded' | 'empty' | 'failed'

const DEFAULT_GUIDE_VIDEO_URL = 'https://www.youtube.com/watch?v=LXb3EKWsInQ'

const isEmptySupportMessage = (message: ChatMessage): boolean => message.id.startsWith('empty_support_')

const createDefaultActions = (prefix: string): ChatAction[] => [
    {
        id: `${prefix}_support_menu`,
        type: 'support-menu',
        label: 'Menu há»— trá»£'
    }
]

const getProductVideoUrl = (product?: UserProduct): string => {
    return product?.product.guide_video_url ||
        product?.product.tutorial_video_url ||
        product?.product.video_url ||
        product?.product.youtube_url ||
        DEFAULT_GUIDE_VIDEO_URL
}

const createSupportActions = (nodeKey: string, buttons: SupportButton[]): ChatAction[] => {
    return buttons.map(button => ({
        id: `${nodeKey}_${button.id}`,
        type: 'support-flow',
        label: button.label,
        buttonId: button.id,
        action: button.action,
        metadata: button.metadata
    }))
}

const createSupportMessage = (node: SupportNode, flow?: SupportFlowRuntime): ChatMessage => {
    const actions = createSupportActions(node.key, node.buttons)
    if (flow?.guide) {
        actions.push({
            id: `${node.key}_guide_${flow.guide.id}`,
            type: 'open-support-guide',
            label: 'Xem hướng dẫn',
            metadata: { guide: flow.guide }
        })
    }
    return {
        id: `support_${node.key}_${Date.now()}`,
        role: 'support',
        sender: 'ai',
        text: node.message,
        guideTitle: flow?.guide?.title,
        guideDescription: flow?.guide?.description,
        guideContentMarkdown: flow?.guide?.content_markdown,
        guideProductTitle: flow?.guide?.product_title,
        guideProductLogoUrl: flow?.guide?.product_logo_url,
        guideUrl: flow?.guide?.url || flow?.guide?.file_url,
        actions
    }
}

const getUniqueUserProducts = (products: UserProduct[]): UserProduct[] => {
    const seen = new Set<number>()
    return products.filter(item => {
        if (seen.has(item.product.id)) return false
        seen.add(item.product.id)
        return true
    })
}

const getSupportTargetKey = (target: SupportTarget): string => `${target.productSlug}:${target.appName}`

const getSupportWebSocketUrl = (conversationId: number, token: string): string => {
    const wsBaseUrl = import.meta.env.VITE_WS_URL ||
        `${import.meta.env.VITE_SERVER_URL.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`
    return `${wsBaseUrl.replace(/\/$/, '')}/support/conversations/${conversationId}/?token=${encodeURIComponent(token)}`
}

const dataUrlToFile = (dataUrl: string, fileName: string): File => {
    const [header, data] = dataUrl.split(',')
    const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png'
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
    }
    return new File([bytes], fileName, { type: mime })
}

const supportMessageToChatMessage = (item: SupportChatMessageResponse): ChatMessage => {
    const isImage = item.message_type === 'image' && Boolean(item.attachment_url)
    const isGuide = item.message_type === 'guide' && Boolean(item.guide_title)
    const guideUrl = item.guide_url || item.guide_file_url || undefined
    return {
        id: `server_${item.id}`,
        role: item.sender === 'system' ? 'status' : item.sender === 'user' ? 'user' : 'support',
        sender: item.sender,
        text: isGuide
            ? item.text || 'Hướng dẫn sử dụng'
            : isImage
                ? item.text || 'Ảnh đính kèm'
                : item.attachment_url
                    ? `${item.text || 'Tệp đính kèm'}\n${item.attachment_url}`
                    : item.text,
        imageUrl: isImage ? item.attachment_url : undefined,
        attachmentUrl: !isImage ? item.attachment_url : undefined,
        guideTitle: isGuide ? item.guide_title : undefined,
        guideDescription: isGuide ? item.guide_description : undefined,
        guideContentMarkdown: isGuide ? item.guide_content_markdown : undefined,
        guideProductTitle: isGuide ? item.guide_product_title : undefined,
        guideProductLogoUrl: isGuide ? item.guide_product_logo_url : undefined,
        guideUrl
    }
}

const ChatPanel = ({ isVisible }: ChatPanelProps): React.JSX.Element => {
    const { currentProfile, currentTab, closeTab, setCurrentProfile, switchTab } = useProfiles()
    const { user, userProducts, appSetting } = useAuth()
    const { closePanel } = usePanel()
    const { t } = useLanguage()
    const currentProduct = useMemo(() => {
        if (!currentProfile || !currentProfile.account) return undefined
        return userProducts.find(item =>
            item.account_group?.accounts.some(account => account.id === currentProfile.account?.id)
        )
    }, [currentProfile, userProducts])
    const supportProducts = useMemo(() => {
        const products = getUniqueUserProducts(userProducts)
        if (!currentProduct) return products

        return [
            ...products.filter(item => item.product.id === currentProduct.product.id),
            ...products.filter(item => item.product.id !== currentProduct.product.id)
        ]
    }, [currentProduct, userProducts])
    const defaultTarget = useMemo<SupportTarget>(() => ({
        productSlug: currentProduct?.product.slug || 'dashboard',
        appName: currentProduct?.product.title || currentTab?.title || currentProfile?.name || 'Ứng dụng hiện tại',
        appLogo: currentProduct?.product.logo_url || currentTab?.favicon || currentProfile?.icon,
        product: currentProduct
    }), [currentProduct, currentProfile, currentTab])
    const [supportTarget, setSupportTarget] = useState<SupportTarget>(defaultTarget)
    const [message, setMessage] = useState('')
    const [screenshot, setScreenshot] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null)
    const [conversationId, setConversationId] = useState<number | null>(null)
    const [lastServerMessageId, setLastServerMessageId] = useState(0)
    const [flowLoading, setFlowLoading] = useState(false)
    const [flowError, setFlowError] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [hasOlderMessages, setHasOlderMessages] = useState(false)
    const [oldestServerMessageId, setOldestServerMessageId] = useState<number | null>(null)
    const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)
    const [pendingTarget, setPendingTarget] = useState<SupportTarget | null>(null)
    const supportTargetRef = useRef<SupportTarget>(defaultTarget)
    const receivedSocketMessageIdsRef = useRef<Set<number>>(new Set())
    const imageInputRef = useRef<HTMLInputElement>(null)
    const messageListRef = useRef<HTMLDivElement>(null)

    const scrollToLatestMessage = useCallback((): void => {
        window.requestAnimationFrame(() => {
            const container = messageListRef.current
            if (container) container.scrollTop = container.scrollHeight
        })
    }, [])

    const appendServerMessage = useCallback((item: SupportChatMessageResponse, includeUser = false): void => {
        if (receivedSocketMessageIdsRef.current.has(item.id)) return
        receivedSocketMessageIdsRef.current.add(item.id)
        setLastServerMessageId(prev => Math.max(prev, item.id))
        if (!includeUser && item.sender === 'user') return
        const nextMessage = supportMessageToChatMessage(item)
        setMessages(prev => [...prev.filter(messageItem => !isEmptySupportMessage(messageItem)), nextMessage])
    }, [])

    const appendServerNodeMessage = useCallback((
        item: SupportChatMessageResponse,
        node: SupportNode,
        flow?: SupportFlowRuntime
    ): void => {
        const nodeMessage = createSupportMessage(node, flow)
        const nextMessage = {
            ...supportMessageToChatMessage(item),
            actions: nodeMessage.actions,
            guideTitle: nodeMessage.guideTitle,
            guideDescription: nodeMessage.guideDescription,
            guideContentMarkdown: nodeMessage.guideContentMarkdown,
            guideProductTitle: nodeMessage.guideProductTitle,
            guideProductLogoUrl: nodeMessage.guideProductLogoUrl,
            guideUrl: nodeMessage.guideUrl
        }
        if (receivedSocketMessageIdsRef.current.has(item.id)) {
            setMessages(prev => prev.map(messageItem =>
                messageItem.id === nextMessage.id
                    ? { ...messageItem, ...nextMessage }
                    : messageItem
            ))
            return
        }
        receivedSocketMessageIdsRef.current.add(item.id)
        setLastServerMessageId(prev => Math.max(prev, item.id))
        if (item.sender !== 'user') {
            setMessages(prev => [...prev.filter(messageItem => !isEmptySupportMessage(messageItem)), nextMessage])
        }
    }, [])

    useEffect(() => {
        supportTargetRef.current = supportTarget
    }, [supportTarget])

    useEffect(() => {
        for (let index = localStorage.length - 1; index >= 0; index -= 1) {
            const key = localStorage.key(index)
            if (key?.startsWith('toolsngon:support-chat:')) {
                localStorage.removeItem(key)
            }
        }
    }, [])

    const hydrateCurrentConversation = useCallback(async (
        isCancelled: () => boolean = () => false
    ): Promise<SupportHydrationResult> => {
        try {
            const res = await api.get<SupportConversationMessagesResponse>('/api/support/conversation/')
            if (isCancelled()) return 'failed'
            if (!res.data.conversation) {
                setSupportTarget(defaultTarget)
                supportTargetRef.current = defaultTarget
                setConversationId(null)
                setMessages([])
                setLastServerMessageId(0)
                setOldestServerMessageId(null)
                setHasOlderMessages(false)
                receivedSocketMessageIdsRef.current = new Set()
                return 'empty'
            }

            const conversation = res.data.conversation
            const matchedProduct = supportProducts.find(item =>
                item.product.id === conversation.product ||
                item.product.slug === conversation.product_slug
            )
            const restoredTarget: SupportTarget = {
                productSlug: conversation.product_slug || defaultTarget.productSlug,
                appName: conversation.product_title || matchedProduct?.product.title || defaultTarget.appName,
                appLogo: conversation.product_logo_url || matchedProduct?.product.logo_url || defaultTarget.appLogo,
                product: matchedProduct
            }
            const targetToRestore = res.data.messages.length > 0 ? restoredTarget : defaultTarget
            setSupportTarget(targetToRestore)
            supportTargetRef.current = targetToRestore
            setConversationId(conversation.id)
            setMessages(res.data.messages.map(supportMessageToChatMessage))
            setOldestServerMessageId(res.data.pagination.oldest_id)
            setHasOlderMessages(res.data.pagination.has_more)
            if (res.data.messages.length > 0) {
                setLastServerMessageId(Math.max(...res.data.messages.map(item => item.id)))
                receivedSocketMessageIdsRef.current = new Set(res.data.messages.map(item => item.id))
            } else {
                setLastServerMessageId(0)
                receivedSocketMessageIdsRef.current = new Set()
            }
            window.requestAnimationFrame(() => {
                const container = messageListRef.current
                if (container) container.scrollTop = container.scrollHeight
            })
            return res.data.messages.length > 0 ? 'loaded' : 'empty'
        } catch {
            return 'failed'
        }
    }, [defaultTarget, supportProducts])

    const loadOlderMessages = useCallback(async (): Promise<void> => {
        if (!conversationId || !oldestServerMessageId || !hasOlderMessages || loadingOlderMessages) return
        const container = messageListRef.current
        const previousScrollHeight = container?.scrollHeight || 0
        const previousScrollTop = container?.scrollTop || 0
        setLoadingOlderMessages(true)
        try {
            const res = await api.get<SupportConversationMessagesResponse>(
                `/api/support/conversations/${conversationId}/messages/`,
                { params: { before_id: oldestServerMessageId, limit: 20 } }
            )
            const olderMessages = res.data.messages
            olderMessages.forEach(item => receivedSocketMessageIdsRef.current.add(item.id))
            setMessages(currentMessages => [
                ...olderMessages.map(supportMessageToChatMessage),
                ...currentMessages
            ])
            setOldestServerMessageId(res.data.pagination.oldest_id)
            setHasOlderMessages(res.data.pagination.has_more)
            window.requestAnimationFrame(() => {
                const currentContainer = messageListRef.current
                if (!currentContainer) return
                currentContainer.scrollTop = previousScrollTop + currentContainer.scrollHeight - previousScrollHeight
            })
        } catch {
            setFlowError('Không tải được các tin nhắn cũ hơn.')
        } finally {
            setLoadingOlderMessages(false)
        }
    }, [conversationId, hasOlderMessages, loadingOlderMessages, oldestServerMessageId])

    const startSupportFlow = useCallback(async (
        target: SupportTarget,
        isCancelled: () => boolean = () => false
    ): Promise<number | null> => {
        setSupportTarget(target)
        setFlowLoading(true)
        setFlowError(null)
        try {
            const res = await api.post<SupportFlowResponse>('/api/support/start/', {
                product_slug: target.productSlug,
                event: 'start'
            })
            if (isCancelled()) return null
            setConversationId(res.data.conversation.id)
            if (res.data.message) {
                if (res.data.node) {
                    appendServerNodeMessage(res.data.message, res.data.node, res.data.flow || undefined)
                } else {
                    appendServerMessage(res.data.message)
                }
            }
            return res.data.conversation.id
        } catch {
            if (isCancelled()) return null
            setFlowError('Không khởi tạo được cuộc trò chuyện hỗ trợ.')
            return null
        } finally {
            if (!isCancelled()) setFlowLoading(false)
        }
    }, [appendServerMessage, appendServerNodeMessage])

    useEffect(() => {
        let cancelled = false
        if (!isVisible || !user?.id) {
            return () => {
                cancelled = true
            }
        }

        hydrateCurrentConversation(() => cancelled).then(result => {
            if (
                cancelled ||
                result !== 'empty'
            ) return
            startSupportFlow(defaultTarget, () => cancelled)
        })
        return () => {
            cancelled = true
        }
    }, [defaultTarget, hydrateCurrentConversation, isVisible, startSupportFlow, user?.id])

    useEffect(() => {
        if (!conversationId || defaultTarget.productSlug === 'dashboard') {
            setPendingTarget(null)
            return
        }
        if (getSupportTargetKey(defaultTarget) === getSupportTargetKey(supportTargetRef.current)) {
            setPendingTarget(null)
        } else {
            setPendingTarget(defaultTarget)
        }
    }, [conversationId, defaultTarget])

    useEffect(() => {
        if (!pendingTarget) return
        window.requestAnimationFrame(() => {
            const container = messageListRef.current
            if (container) container.scrollTop = container.scrollHeight
        })
    }, [pendingTarget])

    useEffect(() => {
        if (!conversationId) return
        let cancelled = false
        let socket: WebSocket | null = null
        let reconnectTimer: number | undefined

        const connect = async (): Promise<void> => {
            try {
                const { access } = await window.auth.get()
                if (cancelled || !access) return
                socket = new WebSocket(getSupportWebSocketUrl(conversationId, access))

                socket.onmessage = (event): void => {
                    if (cancelled) return
                    const payload = JSON.parse(event.data) as SupportSocketEvent
                    if (payload.type === 'message.created') {
                        appendServerMessage(payload.message)
                    }
                }

                socket.onclose = (): void => {
                    if (!cancelled) {
                        reconnectTimer = window.setTimeout(connect, 3000)
                    }
                }

                socket.onerror = (): void => {
                    socket?.close()
                }
            } catch {
                if (!cancelled) {
                    reconnectTimer = window.setTimeout(connect, 3000)
                }
            }
        }

        connect()

        return () => {
            cancelled = true
            if (reconnectTimer) window.clearTimeout(reconnectTimer)
            socket?.close()
        }
    }, [appendServerMessage, conversationId])

    useEffect(() => {
        if (!conversationId) return
        let cancelled = false

        const loadMissedMessages = async (): Promise<void> => {
            try {
                const res = await api.get<{
                    conversation: SupportConversation
                    messages: SupportChatMessageResponse[]
                }>(`/api/support/conversations/${conversationId}/messages/`, {
                    params: { after_id: lastServerMessageId }
                })
                if (cancelled) return
                if (res.data.messages.length > 0) {
                    setLastServerMessageId(Math.max(...res.data.messages.map(item => item.id)))
                }
                const incoming = res.data.messages.filter(item => item.sender !== 'user')
                if (incoming.length > 0) {
                    incoming.forEach(item => appendServerMessage(item))
                }
            } catch {
                /* missed-message sync should stay quiet */
            }
        }

        loadMissedMessages()

        return () => {
            cancelled = true
        }
    }, [appendServerMessage, conversationId, lastServerMessageId])

    const handleOpenGuide = (): void => {
        window.api.openExternal(getProductVideoUrl(supportTarget.product))
    }

    const handleOpenSupportGuide = (item: ChatMessage): void => {
        window.api.supportGuide.open({
            title: item.guideTitle || 'HÆ°á»›ng dáº«n há»— trá»£',
            description: item.guideDescription,
            contentMarkdown: item.guideContentMarkdown || item.guideDescription || item.text,
            guideUrl: item.guideUrl,
            productTitle: item.guideProductTitle,
            productLogoUrl: item.guideProductLogoUrl
        })
    }

    const handleOpenActionGuide = (action: ChatAction): void => {
        const guide = action.metadata?.guide as SupportGuide | undefined
        if (!guide) return
        window.api.supportGuide.open({
            title: guide.title || 'Hướng dẫn sử dụng',
            description: guide.description,
            contentMarkdown: guide.content_markdown || guide.description || '',
            guideUrl: guide.url || guide.file_url,
            productTitle: guide.product_title,
            productLogoUrl: guide.product_logo_url
        })
    }

    const handleCaptureScreenshot = async (): Promise<void> => {
        if (!currentTab?.id) return
        const image = await window.api.browserView.captureScreenshot(currentTab.id)
        if (image) {
            clearSelectedImage()
            setScreenshot(image)
        }
    }

    const handleSelectImage = (): void => {
        imageInputRef.current?.click()
    }

    const handleSelectedImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setFlowError('Vui lòng chọn đúng file ảnh.')
            event.target.value = ''
            return
        }
        setFlowError(null)
        setScreenshot(null)
        setSelectedImage({ file, previewUrl: URL.createObjectURL(file) })
    }

    const clearSelectedImage = (): void => {
        setSelectedImage(null)
        if (imageInputRef.current) imageInputRef.current.value = ''
    }

    const getDesktopAction = (metadata?: Record<string, unknown>): DesktopSupportAction | undefined => {
        const value = metadata?.desktop_action || metadata?.desktopAction || metadata?.app_action || metadata?.appAction
        return typeof value === 'string' ? value as DesktopSupportAction : undefined
    }

    const runDesktopAction = async (action: ChatAction): Promise<void> => {
        const desktopAction = getDesktopAction(action.metadata)
        if (!desktopAction) return

        if (desktopAction === 'go_dashboard' || desktopAction === 'back_dashboard') {
            setCurrentProfile('1')
            switchTab('1', '1')
            closePanel()
            return
        }

        if (desktopAction === 'navigate') {
            const url = action.metadata?.url
            if (currentTab?.id && typeof url === 'string') {
                await window.api.browserView.navigate(currentTab.id, url)
            }
            return
        }

        if (!currentTab?.id) return

        if (desktopAction === 'reload' || desktopAction === 'reload_current_tab') {
            await window.api.browserView.reload(currentTab.id)
            return
        }

        if (desktopAction === 'inject_cookies' || desktopAction === 'reinject_cookies') {
            const cookies = currentProfile?.account?.cookies
            if (cookies && cookies.length > 0) {
                await window.api.browserView.setCookies(currentTab.id, cookies)
                await window.api.browserView.reload(currentTab.id)
            }
            return
        }

        if (
            desktopAction === 'close_app' ||
            desktopAction === 'close_current_app' ||
            desktopAction === 'close_current_tab'
        ) {
            if (currentProfile?.id && currentTab.id !== '1') {
                closeTab(currentProfile.id, currentTab.id)
            }
            closePanel()
        }
    }

    const handleSupportButton = async (action: ChatAction, messageId: string): Promise<void> => {
        if (!conversationId || !action.buttonId || flowLoading) return
        setFlowLoading(true)
        setFlowError(null)
        const timestamp = Date.now()
        setMessages(prev => [
            ...prev.map(item =>
                item.id === messageId
                    ? { ...item, actions: undefined }
                    : item
            ),
            {
                id: `user_button_${timestamp}`,
                role: 'user',
                sender: 'user',
                text: action.label
            }
        ])
        scrollToLatestMessage()

        try {
            const res = await api.post<SupportFlowResponse>(
                `/api/support/conversations/${conversationId}/button/`,
                { button_id: action.buttonId }
            )
            const selectedButton = res.data.button
            const url = selectedButton?.metadata?.url
            if (selectedButton?.action === 'open_url' && typeof url === 'string') {
                window.api.openExternal(url)
            }
            await runDesktopAction({
                id: String(selectedButton?.id || action.id),
                type: 'support-flow',
                label: selectedButton?.label || action.label,
                buttonId: selectedButton?.id || action.buttonId,
                action: selectedButton?.action || action.action,
                metadata: selectedButton?.metadata || action.metadata
            })
            setConversationId(res.data.conversation.id)
            const responseNode = res.data.node
            if (res.data.message && responseNode) {
                appendServerNodeMessage(res.data.message, responseNode, res.data.flow || undefined)
            } else if (responseNode) {
                setMessages(prev => [...prev, createSupportMessage(responseNode, res.data.flow || undefined)])
            }
        } catch {
            setFlowError('Không thể chuyển bước hỗ trợ. Vui lòng thử lại.')
            setMessages(prev => [
                ...prev,
                {
                    id: `support_error_${timestamp}`,
                    role: 'support',
                    sender: 'ai',
                    text: 'Không thể chuyển bước hỗ trợ. Vui lòng thử lại.',
                    actions: createDefaultActions(`support_error_${timestamp}`)
                }
            ])
        } finally {
            setFlowLoading(false)
        }
    }

    const handleMessageAction = async (messageId: string, action: ChatAction): Promise<void> => {
        if (action.type === 'open-guide-video') {
            handleOpenGuide()
            return
        }
        if (action.type === 'open-support-guide') {
            handleOpenActionGuide(action)
            return
        }
        if (action.type === 'capture-screenshot') {
            await handleCaptureScreenshot()
            return
        }
        if (action.type === 'support-menu') {
            await startSupportFlow(supportTargetRef.current)
            return
        }
        if (action.type === 'support-flow') {
            await handleSupportButton(action, messageId)
        }
    }

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault()
        const cleanMessage = message.trim()
        if (!cleanMessage && !screenshot && !selectedImage) return
        const timestamp = Date.now()
        const screenshotImage = screenshot
        const imageAttachment = selectedImage
        const targetConversationId = conversationId || await startSupportFlow(supportTargetRef.current)

        if (!targetConversationId) {
            setFlowError('Khong khoi tao duoc cuoc tro chuyen ho tro.')
            return
        }

        setMessages(prev => [
            ...prev.filter(messageItem => !isEmptySupportMessage(messageItem)),
            {
                id: `user_${timestamp}`,
                role: 'user',
                sender: 'user',
                text: cleanMessage || (imageAttachment ? 'Anh dinh kem' : 'Anh chup man hinh'),
                screenshot: screenshotImage || undefined,
                imageUrl: imageAttachment ? imageAttachment.previewUrl : undefined
            }
        ])
        scrollToLatestMessage()

        const body = new FormData()
        body.append('text', cleanMessage)
        body.append('sender', 'user')
        if (imageAttachment) {
            body.append('attachment', imageAttachment.file)
        } else if (screenshotImage) {
            body.append('attachment', dataUrlToFile(screenshotImage, `support-screenshot-${timestamp}.png`))
        }

        setMessage('')
        setScreenshot(null)
        clearSelectedImage()

        api.post(`/api/support/conversations/${targetConversationId}/messages/`, body).catch(() => {
            setFlowError('Khong gui duoc tin nhan ho tro.')
        })
    }
    return (
        <div className={`relative w-124 min-w-124 h-full bg-white border-l border-slate-200 overflow-hidden panel-slide-in flex flex-col ${isVisible ? '' : 'hidden'}`}>
            <div className="px-4 py-2 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                        {supportTarget.appLogo && (
                            <div className="size-10 min-w-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <img className="h-full w-full object-cover" src={supportTarget.appLogo} alt={supportTarget.appName} />
                            </div>
                        )}
                        <div className="min-w-0 flex flex-col justify-center gap-1">
                            {currentProfile?.account?.name && (
                                <h1 className="text-sm font-medium text-slate-800">{currentProfile.account.name}</h1>
                            )}
                            <span className="truncate text-xs leading-3 text-slate-800">{supportTarget.appName}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size='icon-sm' onClick={closePanel}>
                                    <PanelRightCloseIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Đóng panel</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>
                </div>
            </div >

            <div ref={messageListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {hasOlderMessages && (
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={loadingOlderMessages}
                            onClick={loadOlderMessages}
                            className="h-7 text-xs text-slate-500"
                        >
                            {loadingOlderMessages ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
                        </Button>
                    </div>
                )}
                {messages.map((item, index) => {
                    const previousItem = messages[index - 1]
                    const isSameSenderAsPrevious = Boolean(
                        previousItem &&
                        previousItem.role !== 'status' &&
                        item.role !== 'status' &&
                        previousItem.role === item.role &&
                        (previousItem.sender || previousItem.role) === (item.sender || item.role)
                    )
                    const showSupportIdentity = item.role === 'support' && !isSameSenderAsPrevious

                    return (
                        item.role === 'status' ? (
                            <div className="flex w-full justify-center" key={item.id}>
                                <div className="max-w-[82%] text-center text-[11px] leading-5 text-slate-500">
                                    {item.text}
                                </div>
                            </div>
                        ) : (
                            <div className={`flex w-full items-start gap-1.5 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`} key={item.id}>
                                {showSupportIdentity && (
                                    <div className="flex items-center gap-2 p-2 bg-accent rounded-full size-10 min-w-10 overflow-hidden border border-slate-200">
                                        <img src={logoSvg} alt="Logo" />
                                    </div>
                                )}
                                {item.role === 'support' && !showSupportIdentity && (
                                    <div className="size-10 min-w-10" aria-hidden="true" />
                                )}
                                <div className={`flex flex-col gap-1 ${item.role === 'user' ? 'max-w-[80%] items-end' : 'max-w-[78%] items-start'}`}>
                                    {showSupportIdentity && (
                                        <div className="text-xs ml-2 font-medium text-accent-foreground flex items-center gap-1">
                                            <p>Toolsngon</p>
                                            <BadgeCheck className="fill-blue-600 stroke-white size-4"></BadgeCheck>
                                        </div>
                                    )}
                                    <div
                                        className={`w-fit max-w-full rounded-lg px-3 py-2 text-sm ${item.role === 'user'
                                            ? 'bg-slate-800 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        <div>{item.text}</div>
                                        {item.screenshot && (
                                            <img
                                                className="mt-2 max-h-48 w-full rounded-md border border-white/20 object-cover"
                                                src={item.screenshot}
                                                alt="Ảnh chụp màn hình"
                                            />
                                        )}
                                        {item.imageUrl && (
                                            <img
                                                className="mt-2 max-h-48 w-full rounded-md border border-white/20 object-cover"
                                                src={item.imageUrl}
                                                alt="Ảnh đính kèm"
                                            />
                                        )}
                                        {item.guideTitle && (
                                            <button onClick={() => handleOpenSupportGuide(item)} className="mt-2 text-left cursor-pointer min-w-62 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                                                        <img src={item.guideProductLogoUrl} alt="Toolsngon" className="h-full w-full object-contain" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                                                            <FileTextIcon size={15} className="shrink-0 text-blue-600" />
                                                            <span className="truncate">{item.guideTitle}</span>
                                                        </div>
                                                        <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.guideDescription || item.guideContentMarkdown?.slice(0, 24) + '...'}</div>
                                                    </div>
                                                </div>
                                                {item.guideDescription && (
                                                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.guideDescription}</p>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    {item.actions && item.actions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.actions.map(action => (
                                                <button
                                                    key={action.id}
                                                    type="button"
                                                    onClick={() => handleMessageAction(item.id, action)}
                                                    disabled={flowLoading && action.type === 'support-flow'}
                                                    className="h-7 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 flex items-center gap-1.5"
                                                >
                                                    {action.type === 'open-guide-video' && <VideoIcon size={13} />}
                                                    {action.type === 'capture-screenshot' && <CameraIcon size={13} />}
                                                    {action.type === 'support-flow' && action.action === 'open_url' && <VideoIcon size={13} />}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    )
                })}
            </div>

            <form onSubmit={handleSubmit} className="p-4">
                {flowError && (
                    <div className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        {flowError}
                    </div>
                )}
                {screenshot && (
                    <div className="relative max-h-32 w-1/2 aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-50 mb-2">
                        <img className="object-contain" src={screenshot} alt="Ảnh chụp màn hình đính kèm" />
                        <button
                            type="button"
                            onClick={() => setScreenshot(null)}
                            className="absolute right-2 top-2 size-7 rounded-md bg-white/90 shadow hover:bg-white flex items-center justify-center text-slate-700"
                        >
                            <XIcon size={14} />
                        </button>
                    </div>
                )}
                {selectedImage && (
                    <div className="relative max-h-32 w-1/2 aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-50 mb-2">
                        <img className="h-full w-full object-contain" src={selectedImage.previewUrl} alt={selectedImage.file.name} />
                        <button
                            type="button"
                            onClick={clearSelectedImage}
                            className="absolute right-2 top-2 size-7 rounded-md bg-white/90 shadow hover:bg-white flex items-center justify-center text-slate-700"
                        >
                            <XIcon size={14} />
                        </button>
                    </div>
                )}


                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.10)] transition-colors focus-within:border-slate-300">
                    <Carousel
                        opts={{ align: 'start', dragFree: true }}
                        className="mb-2 w-full"
                        aria-label="Chá»n luá»“ng há»— trá»£"
                    >
                        <CarouselContent className="-ml-2">
                            {supportProducts.map(item => {
                                const isActive = supportTarget.productSlug === item.product.slug
                                return (
                                    <CarouselItem key={item.product.id} className="basis-auto pl-2">
                                        <Button
                                            type="button"
                                            disabled={flowLoading}
                                            size={'sm'}
                                            variant={'secondary'}
                                            className="rounded-full pl-1.5 pr-3"
                                            aria-pressed={isActive}
                                            onClick={() => startSupportFlow({
                                                productSlug: item.product.slug,
                                                appName: item.product.title,
                                                appLogo: item.product.logo_url,
                                                product: item
                                            })}
                                        >
                                            <span className="size-5 overflow-hidden rounded-full">
                                                <img
                                                    className="h-full w-full object-cover"
                                                    src={item.product.logo_url || logoSvg}
                                                    alt={item.product.title}
                                                />
                                            </span>
                                            <span className="line-clamp-2 leading-4">{item.product.title}</span>
                                        </Button>
                                    </CarouselItem>
                                )
                            })}
                        </CarouselContent>
                    </Carousel>
                    <input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={t('supportChat.inputMessagePlaceholder')}
                    className="h-8 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSelectedImageChange}
                            />
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        type="button"
                                        size='icon'
                                        variant="outline"
                                        aria-label="Thêm hình ảnh"
                                        className="rounded-full bg-white!"
                                        onClick={handleSelectImage}
                                    >
                                        <ImagePlusIcon />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Thêm hình ảnh</p>
                                </TooltipContent>
                            </Tooltip>
                            {appSetting && appSetting.socials.length > 0 && (
                                appSetting.socials.map(social => (
                                    <a
                                        key={social.title}
                                        href={social.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="size-8"
                                    >
                                        <Button
                                            type="button"
                                            size='icon-sm'
                                            variant="outline"
                                            className="rounded-full bg-white! p-0 overflow-hidden"
                                        >
                                            <img className="h-full w-full object-cover" src={social.icon} alt="" />
                                        </Button>
                                    </a>
                                ))
                            )}
                        </div>
                        <Button
                            size='icon'
                            type="submit"
                            aria-label="Gá»­i tin nháº¯n"
                            className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                            disabled={!message.trim() && !screenshot && !selectedImage}
                        >
                            <ArrowUpIcon size={18} />
                        </Button>
                    </div>
                </div>

            </form>
        </div >
    )
}

export default ChatPanel
