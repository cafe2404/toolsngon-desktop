import { JSX } from "react";
import { Progress } from "@components/ui/progress"
import { Spinner } from "../../components/ui/spinner";
import { useUpdater } from "../../contexts/UpdaterContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Updater(): JSX.Element {
    const { status, progress, error } = useUpdater()
    const { t } = useLanguage()

    const renderStatus = (): string => {
        switch (status) {
            case "checking":
                return t('updater.checking')
            case "available":
                return t('updater.available')
            case "downloading":
                return t('updater.downloading', { progress: Math.round(progress) })
            case "downloaded":
                return t('updater.downloaded')
            case "not-available":
                return t('updater.notAvailable')
            case "error":
                return t('updater.error', { error: error || t('updater.unknownError') })
            default:
                return t('updater.preparing')
        }
    }

    return (
        <>
            <Spinner className="size-12" />
            <h1 className='text-slate-800 text-2xl font-medium'>
                {renderStatus()}
            </h1>
            <Progress value={progress} className="w-full" />
            <p className='text-slate-600 font-medium'>
                {t('updater.keepPcOn')}
            </p>
        </>
    )
}
