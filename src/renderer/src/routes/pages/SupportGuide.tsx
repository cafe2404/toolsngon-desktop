import { useEffect, useMemo, useState } from 'react'
import { BookOpenIcon, ExternalLinkIcon, PanelLeftClose } from 'lucide-react'
import Markdown from 'react-native-markdown-display'
import logoSvg from '../../assets/logo_2.svg'
import { Button } from '../../components/ui/button'
import api from '../../lib/axios'
import { useLanguage } from '../../contexts/LanguageContext'

type SupportGuidePayload = {
  title: string
  description?: string
  contentMarkdown?: string
  guideUrl?: string
  productTitle?: string
  productLogoUrl?: string
}

type SupportGuideItem = {
  id: number
  title: string
  description?: string
  content_markdown?: string
  file_url?: string
  url?: string
  product_title?: string
  product_logo_url?: string
}

const markdownStyles = {
  body: {
    alignSelf: 'stretch',
    color: '#334155',
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'left',
    width: '100%'
  },
  heading1: { alignSelf: 'stretch', color: '#0f172a', fontSize: 26, fontWeight: '700', lineHeight: 34, marginBottom: 16, textAlign: 'left' },
  heading2: { alignSelf: 'stretch', color: '#0f172a', fontSize: 22, fontWeight: '700', lineHeight: 30, marginBottom: 12, marginTop: 24, textAlign: 'left' },
  heading3: { alignSelf: 'stretch', color: '#0f172a', fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 10, marginTop: 18, textAlign: 'left' },
  paragraph: { alignSelf: 'stretch', marginBottom: 14, textAlign: 'left', width: '100%' },
  text: { textAlign: 'left' },
  bullet_list: { alignSelf: 'stretch', marginBottom: 14, width: '100%' },
  ordered_list: { alignSelf: 'stretch', marginBottom: 14, width: '100%' },
  list_item: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 6,
    width: '100%'
  },
  bullet_list_icon: { color: '#334155', marginRight: 8, textAlign: 'left' },
  bullet_list_content: { flex: 1, textAlign: 'left' },
  ordered_list_icon: { color: '#334155', marginRight: 8, textAlign: 'left' },
  ordered_list_content: { flex: 1, textAlign: 'left' },
  link: { color: '#2563eb', fontWeight: '700' },
  code_inline: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    color: '#0f172a',
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  fence: {
    alignSelf: 'stretch',
    backgroundColor: '#020617',
    borderRadius: 10,
    color: '#f8fafc',
    marginBottom: 14,
    padding: 14
  },
  blockquote: {
    alignSelf: 'stretch',
    backgroundColor: '#f8fafc',
    borderLeftColor: '#cbd5e1',
    borderLeftWidth: 4,
    color: '#475569',
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  table: { alignSelf: 'stretch', borderColor: '#cbd5e1', borderWidth: 1, marginBottom: 14 },
  th: { backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '700' },
  tr: { borderBottomColor: '#e2e8f0', borderBottomWidth: 1 }
} as const

function SupportGuide(): React.JSX.Element {
  const { t } = useLanguage()
  const [payload, setPayload] = useState<SupportGuidePayload | null>(null)
  const [guides, setGuides] = useState<SupportGuideItem[]>([])
  const [showGuideList, setShowGuideList] = useState(false)
  const [guidesLoading, setGuidesLoading] = useState(false)
  const [guidesError, setGuidesError] = useState<string | null>(null)

  useEffect(() => {
    window.api.supportGuide.getPayload().then(setPayload)
    return window.api.supportGuide.onPayloadUpdated(setPayload)
  }, [])

  const loadGuides = async (): Promise<void> => {
    setShowGuideList(true)
    if (guides.length > 0 || guidesLoading) return
    try {
      setGuidesLoading(true)
      setGuidesError(null)
      const res = await api.get<SupportGuideItem[]>('/api/support/user/guides/')
      setGuides(res.data)
    } catch {
      setGuidesError(t('supportGuide.loadError'))
    } finally {
      setGuidesLoading(false)
    }
  }

  const openGuideItem = (guide: SupportGuideItem): void => {
    setPayload({
      title: guide.title,
      description: guide.description,
      contentMarkdown: guide.content_markdown || guide.description || '',
      guideUrl: guide.url || guide.file_url,
      productTitle: guide.product_title,
      productLogoUrl: guide.product_logo_url
    })
  }
  const toggleGuideList = (): void => {
    setShowGuideList(prev => !prev)
  }
  const content = payload?.contentMarkdown || payload?.description || t('supportGuide.emptyContent')
  const markdownContent = useMemo(() => content, [content])
  const handleLinkPress = (url: string): boolean => {
    window.api.openExternal(url)
    return false
  }
  useEffect(() => {
    loadGuides()
  }, [])
  return (
    <main className='h-full w-screen z-50 bg-white flex flex-col overflow-y-hidden'>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
              <img src={payload?.productLogoUrl || logoSvg} alt={payload?.productTitle || 'Toolsngon'} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{payload?.title || t('supportGuide.fallbackTitle')}</h1>
              {(payload?.productTitle || payload?.description) && (
                <p className="mt-0.5 text-left truncate text-sm text-slate-500">{payload.productTitle || payload.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {payload?.guideUrl && (
              <Button type="button" onClick={() => window.api.openExternal(payload.guideUrl!)}>
                <ExternalLinkIcon size={16} />
                {t('supportGuide.openOriginalFile')}
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 relative">
        <div className="absolute top-4 left-4">
          <Button type="button" variant="outline" onClick={toggleGuideList}>
            <BookOpenIcon size={16} />
            {t('supportGuide.allGuides')}
          </Button>
        </div>
        {showGuideList && (
          <aside className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 z-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{t('supportGuide.allGuides')}</h2>
              <Button variant={'outline'} type="button" size="icon-sm" onClick={() => setShowGuideList(false)}>
                <PanelLeftClose></PanelLeftClose>
              </Button>
            </div>
            {guidesLoading && <div className="text-sm text-slate-500">{t('common.loading')}</div>}
            {guidesError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{guidesError}</div>}
            {!guidesLoading && !guidesError && guides.length === 0 && (
              <div className="text-sm text-slate-500">{t('supportGuide.emptyGuides')}</div>
            )}
            <div className="space-y-2">
              {guides.map(guide => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => openGuideItem(guide)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <img src={guide.product_logo_url || logoSvg} alt={guide.product_title || 'Toolsngon'} className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">{guide.title}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">{guide.product_title || t('supportGuide.generalGuide')}</div>
                    </div>
                  </div>
                  {guide.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{guide.description}</p>}
                </button>
              ))}
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1 px-8 py-8 overflow-y-auto h-full">
          <article className="">
            <div className="mx-auto w-full max-w-4xl text-left ">
              <Markdown style={markdownStyles} onLinkPress={handleLinkPress}>
                {markdownContent}
              </Markdown>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}

export default SupportGuide
